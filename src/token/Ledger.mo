import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";

// The token's balance rules. Nothing here awaits, and the canister calls it without
// awaiting, so each operation runs whole: no other message can read or change the balances
// halfway through. An await inside a transfer is what allowed a double spend, so
// tests/policy.test.ts forbids `await` in this file and in main.mo.
module {
  public type Balances = HashMap.HashMap<Principal, Nat>;
  public type Claims = HashMap.HashMap<Principal, ()>;

  public let claimAmount : Nat = 10_000;

  // The dashboard shows these strings to the user, and treats only `success` as success.
  public let success = "success";
  public let insufficient = "Insufficient amount";
  public let alreadyClaimed = "Already claimed";
  public let anonymousCaller = "Anonymous caller not allowed";
  public let invalidRecipient = "Invalid recipient";
  public let invalidAmount = "Invalid amount";

  public func balanceOf(balances : Balances, who : Principal) : Nat {
    switch (balances.get(who)) {
      case null 0;
      case (?balance) balance;
    };
  };

  // Moves an amount the caller has already checked is covered.
  func move(balances : Balances, from : Principal, to : Principal, amount : Nat) {
    balances.put(from, balanceOf(balances, from) - amount);
    balances.put(to, balanceOf(balances, to) + amount);
  };

  public func transfer(balances : Balances, from : Principal, to : Principal, amount : Nat) : Text {
    if (Principal.isAnonymous(from)) return anonymousCaller;
    if (Principal.isAnonymous(to)) return invalidRecipient;
    if (amount == 0) return invalidAmount;
    if (balanceOf(balances, from) < amount) return insufficient;
    move(balances, from, to, amount);
    success;
  };

  // Pays the one-time claim from the owner's balance. The owner holds the reserve, so
  // claiming would only move tokens to itself.
  public func claim(balances : Balances, claims : Claims, owner : Principal, caller : Principal) : Text {
    if (Principal.isAnonymous(caller)) return anonymousCaller;
    if (caller == owner or claims.get(caller) != null) return alreadyClaimed;
    if (balanceOf(balances, owner) < claimAmount) return insufficient;
    move(balances, owner, caller, claimAmount);
    claims.put(caller, ());
    success;
  };

  public func newClaims(claimed : [Principal]) : Claims {
    let claims = HashMap.HashMap<Principal, ()>(claimed.size(), Principal.equal, Principal.hash);
    for (who in claimed.vals()) {
      claims.put(who, ());
    };
    claims;
  };

  // The old canister counted anyone with a balance entry as having claimed. Keeping that on
  // upgrade means the fix hands out no second claim, at the cost of a holder who never
  // actually claimed not getting one.
  public func addHolders(claims : Claims, entries : [(Principal, Nat)]) {
    for ((who, _) in entries.vals()) {
      claims.put(who, ());
    };
  };
};
