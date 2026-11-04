import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Ledger "Ledger";

// Public API over Ledger.mo, plus storage across upgrades. Do not add `await` here: see
// the note at the top of Ledger.mo.
persistent actor Token {
  transient let owner : Principal = Principal.fromText("mufkn-ru5es-fwug7-yutmo-tzrcy-bw55f-amulz-dul4h-skb5x-6l7ht-tae");
  transient let totalSupply : Nat = 100000000000000000;
  transient let symbol : Text = "DAlpha";

  private var balanceEntries : [(Principal, Nat)] = [];
  private transient var balances : Ledger.Balances = do {
    let map = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);
    map.put(owner, totalSupply);
    map
  };

  private var claimEntries : [Principal] = [];
  private transient var claims : Ledger.Claims = Ledger.newClaims([]);

  // False until this code's preupgrade has run, so the first postupgrade after this
  // variable was added can tell that it is upgrading from the old canister. A new stable
  // variable starts at its initial value on that upgrade too, which rules out anything simpler.
  private var claimsTracked : Bool = false;

  public query func balanceOf(who : Principal) : async Nat {
    Ledger.balanceOf(balances, who);
  };

  public query func getSymbol() : async Text {
    symbol;
  };

  public shared ({ caller }) func claim() : async Text {
    Ledger.claim(balances, claims, owner, caller);
  };

  public shared ({ caller }) func transfer(to : Principal, amount : Nat) : async Text {
    Ledger.transfer(balances, caller, to, amount);
  };

  system func preupgrade() {
    balanceEntries := Iter.toArray(balances.entries());
    claimEntries := Iter.toArray(claims.keys());
    claimsTracked := true;
  };

  system func postupgrade() {
    balances := HashMap.fromIter<Principal, Nat>(balanceEntries.vals(), 1, Principal.equal, Principal.hash);
    if (balances.size() < 1) {
      balances.put(owner, totalSupply);
    };
    claims := Ledger.newClaims(claimEntries);
    if (not claimsTracked) {
      Ledger.addHolders(claims, balanceEntries);
      claimsTracked := true;
    };
  };
}
