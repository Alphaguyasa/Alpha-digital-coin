import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

persistent actor Token {
  transient var owner : Principal = Principal.fromText("mufkn-ru5es-fwug7-yutmo-tzrcy-bw55f-amulz-dul4h-skb5x-6l7ht-tae");
  transient var totalSupply : Nat = 100000000000000000;
  transient var symbol : Text = "DAlpha";

  private stable var balanceEntries : [(Principal, Nat)] = [];
  private transient var balances : HashMap.HashMap<Principal, Nat> = do {
    let map = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);
    map.put(owner, totalSupply);
    map
  };

  public query func balanceOf(who : Principal) : async Nat {
    let balance = switch (balances.get(who)) {
      case null 0;
      case (?result) result;
    };
    return balance;
  };

  public query func getSymbol() : async Text {
    return symbol;
  };

  public shared (msg) func claim() : async Text {
    let amount = 10000;
    Debug.print(debug_show (msg.caller));
    switch (balances.get(msg.caller)) {
      case null {
        let ownerBalance = switch (balances.get(owner)) {
          case null 0;
          case (?b) b;
        };
        if (ownerBalance < amount) return "Insufficient amount";
        balances.put(owner, ownerBalance - amount);
        let callerBalance = switch (balances.get(msg.caller)) {
          case null 0;
          case (?b) b;
        };
        balances.put(msg.caller, callerBalance + amount);
        return "success";
      };
      case (?_) {
        return "Already claimed";
      };
    };
  };

  public shared (msg) func transfer(to : Principal, amount : Nat) : async Text {
    let fromBalance = await balanceOf(msg.caller);
    if (fromBalance >= amount) {
      let newFromBalance : Nat = fromBalance - amount;
      balances.put(msg.caller, newFromBalance);
      let toBalance = await balanceOf(to);
      let newToBalance = toBalance + amount;
      balances.put(to, newToBalance);
      return "success";
    } else {
      return "Insufficient amount";
    };
  };

  system func preupgrade() {
    balanceEntries := Iter.toArray(balances.entries());
  };

  system func postupgrade() {
    balances := HashMap.fromIter<Principal, Nat>(balanceEntries.vals(), 1, Principal.equal, Principal.hash);
    if (balances.size() < 1) {
      balances.put(owner, totalSupply);
    };
  };
}
