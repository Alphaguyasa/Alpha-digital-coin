// Runs in the Motoko interpreter: moc -r --package base <base> tests/canister/Ledger.test.mo
// A failed assert ends the run with an error, which fails scripts/check-canister.sh.
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Ledger "../../src/token/Ledger";

let owner = Principal.fromText("mufkn-ru5es-fwug7-yutmo-tzrcy-bw55f-amulz-dul4h-skb5x-6l7ht-tae");
let alice = Principal.fromText("tgydz-3mdpf-xmgvg-asvd3-63kif-d34vo-7ujti-ihknj-qtqii-saomi-iae");
let bob = Principal.fromText("rdmx6-jaaaa-aaaaa-aaadq-cai");
let anonymous = Principal.fromText("2vxsx-fae");

let supply : Nat = 100_000_000_000_000_000;
// Larger than any fixed-width integer: Nat must not wrap.
let huge : Nat = 340_282_366_920_938_463_463_374_607_431_768_211_456;

func newBalances() : Ledger.Balances {
  let balances = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);
  balances.put(owner, supply);
  balances;
};

func total(balances : Ledger.Balances) : Nat {
  var sum = 0;
  for (balance in balances.vals()) {
    sum += balance;
  };
  sum;
};

// balanceOf
do {
  let balances = newBalances();
  assert Ledger.balanceOf(balances, owner) == supply;
  assert Ledger.balanceOf(balances, alice) == 0;
};

// claim pays once, from the owner
do {
  let balances = newBalances();
  let claims = Ledger.newClaims([]);
  assert Ledger.claim(balances, claims, owner, alice) == Ledger.success;
  assert Ledger.balanceOf(balances, alice) == Ledger.claimAmount;
  assert Ledger.balanceOf(balances, owner) == supply - Ledger.claimAmount;
  assert Ledger.claim(balances, claims, owner, alice) == Ledger.alreadyClaimed;
  assert Ledger.balanceOf(balances, alice) == Ledger.claimAmount;
  assert total(balances) == supply;
};

// claim stays used after the balance is spent
do {
  let balances = newBalances();
  let claims = Ledger.newClaims([]);
  assert Ledger.claim(balances, claims, owner, alice) == Ledger.success;
  assert Ledger.transfer(balances, alice, bob, Ledger.claimAmount) == Ledger.success;
  assert Ledger.balanceOf(balances, alice) == 0;
  assert Ledger.claim(balances, claims, owner, alice) == Ledger.alreadyClaimed;
};

// receiving tokens does not use up a claim, and a zero transfer cannot block one
do {
  let balances = newBalances();
  let claims = Ledger.newClaims([]);
  assert Ledger.claim(balances, claims, owner, alice) == Ledger.success;
  assert Ledger.transfer(balances, alice, bob, 0) == Ledger.invalidAmount;
  assert Ledger.transfer(balances, alice, bob, 5) == Ledger.success;
  assert Ledger.claim(balances, claims, owner, bob) == Ledger.success;
  assert Ledger.balanceOf(balances, bob) == Ledger.claimAmount + 5;
  assert total(balances) == supply;
};

// the owner cannot claim, and an empty reserve pays nothing and records nothing
do {
  let balances = newBalances();
  let claims = Ledger.newClaims([]);
  assert Ledger.claim(balances, claims, owner, owner) == Ledger.alreadyClaimed;
  balances.put(owner, Ledger.claimAmount - 1);
  assert Ledger.claim(balances, claims, owner, alice) == Ledger.insufficient;
  assert Ledger.balanceOf(balances, alice) == 0;
  balances.put(owner, Ledger.claimAmount);
  assert Ledger.claim(balances, claims, owner, alice) == Ledger.success;
  assert Ledger.balanceOf(balances, owner) == 0;
};

// anonymous callers and recipients
do {
  let balances = newBalances();
  let claims = Ledger.newClaims([]);
  assert Ledger.claim(balances, claims, owner, anonymous) == Ledger.anonymousCaller;
  assert Ledger.transfer(balances, anonymous, alice, 1) == Ledger.anonymousCaller;
  assert Ledger.transfer(balances, owner, anonymous, 1) == Ledger.invalidRecipient;
  assert Ledger.balanceOf(balances, anonymous) == 0;
  assert total(balances) == supply;
};

// transfer: exact balance, overspend, underflow, huge amounts
do {
  let balances = newBalances();
  assert Ledger.transfer(balances, owner, alice, 100) == Ledger.success;
  assert Ledger.transfer(balances, alice, bob, 101) == Ledger.insufficient;
  assert Ledger.balanceOf(balances, alice) == 100;
  assert Ledger.balanceOf(balances, bob) == 0;
  assert Ledger.transfer(balances, alice, bob, huge) == Ledger.insufficient;
  assert Ledger.transfer(balances, alice, bob, 100) == Ledger.success;
  assert Ledger.balanceOf(balances, alice) == 0;
  assert Ledger.balanceOf(balances, bob) == 100;
  assert Ledger.transfer(balances, alice, bob, 1) == Ledger.insufficient;
  assert total(balances) == supply;
};

// double spend: the second spend of the same balance fails
do {
  let balances = newBalances();
  assert Ledger.transfer(balances, owner, alice, 100) == Ledger.success;
  assert Ledger.transfer(balances, alice, bob, 100) == Ledger.success;
  assert Ledger.transfer(balances, alice, bob, 100) == Ledger.insufficient;
  assert Ledger.balanceOf(balances, bob) == 100;
  assert total(balances) == supply;
};

// a balance above any fixed-width limit does not wrap
do {
  let balances = newBalances();
  balances.put(alice, huge);
  assert Ledger.transfer(balances, alice, bob, huge) == Ledger.success;
  assert Ledger.balanceOf(balances, bob) == huge;
  balances.put(alice, huge);
  assert Ledger.transfer(balances, alice, bob, huge) == Ledger.success;
  assert Ledger.balanceOf(balances, bob) == huge + huge;
};

// transfer to yourself keeps the balance
do {
  let balances = newBalances();
  assert Ledger.transfer(balances, owner, alice, 100) == Ledger.success;
  assert Ledger.transfer(balances, alice, alice, 100) == Ledger.success;
  assert Ledger.balanceOf(balances, alice) == 100;
  assert Ledger.transfer(balances, alice, alice, 101) == Ledger.insufficient;
  assert total(balances) == supply;
};

// claims survive being rebuilt, and old holders count as having claimed
do {
  let balances = newBalances();
  let claims = Ledger.newClaims([alice]);
  assert Ledger.claim(balances, claims, owner, alice) == Ledger.alreadyClaimed;
  Ledger.addHolders(claims, [(bob, 5)]);
  assert Ledger.claim(balances, claims, owner, bob) == Ledger.alreadyClaimed;
  assert Ledger.balanceOf(balances, bob) == 0;
};

Debug.print("Ledger tests passed");
