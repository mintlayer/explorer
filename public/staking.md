If you're not up for running your own staking pool but still want to earn rewards from staking, delegating your coins is an excellent choice. The process is trustless, giving you peace of mind knowing you can always retrieve your coins without the pool manager's consent.

> You can use delegation to increase your own pool's size or to stake your coins to someone else's pool.

#### Steps to Delegate Your Coins:

1. **Create a New Delegation**: Before you can delegate for staking, you need to have a delegation. This step helps in that:

   ```bash
   delegation-create <OWNER> <POOL_ID>
   ```

   `<OWNER>` is the address of the owner of the delegation, who can sign transactions to move money out of it, or _unstake_.
   `<POOL_ID>` is the ID of the pool you want to delegate the coin to.
   Following this command, Mintlayer Wallet will provide you with a unique delegation ID. Keep this ID safe; you'll need it in subsequent steps.

2. **Discover Available Delegations**: List the delegations you have created:

   ```bash
   delegation-list-ids
   ```

   This command displays available delegation IDs alongside their respective balances.

3. **Delegate for Staking**: With your delegation created, you can now delegate your coins for staking:

   ```bash
   delegation-stake <AMOUNT> <DELEGATION_ID>
   ```

   Remember, while your coins are safe and under your control, the staking reward is contingent on the pool's proper operation.

4. **Retrieve Coins from Delegation**: If you ever need to pull your coins from a delegation and send them to a specific address, use the following command:

   ```bash
   delegation-send-to-address <ADDRESS> <AMOUNT> <DELEGATION_ID>
   ```

   Make sure to provide the necessary parameters, like the destination address.

> Retrieving Coins from a delegation incurs a 7200-block maturity period, which means the coins are frozen for about 10 days.

#### Example

```
Wallet> address-new
tmt1q80n8emgq9d92dgwahgmg2efuy4krljwv5qkfrjg
Wallet> delegation-create tmt1q80n8em...uy4krljwv5qkfrjg tpool12ud...3ahp5ejnzh7a59ylvzl39elqcs5zpc5e
Success, the creation of delegation transaction was broadcast to the network. Delegation id: tdelg1c3hxuzwmwc9yu2syyd8f699sj8t5tz78cmxya4snz9l7ml8yjesstw0cuk
Wallet> delegation-stake 1000 tdelg1c3hxuzwmwc9yu2syyd8f699sj8t5tz78cmxya4snz9l7ml8yjesstw0cuk
Success, the delegation staking transaction was broadcast to the network
[.. after a few minutes .. ]
Wallet> delegation-list-ids
[Delegation Id: tdelg1c3hxuzwmwc9yu2syyd8f699sj8t5tz78cmxya4snz9l7ml8yjesstw0cuk, Balance: 1000]
```
