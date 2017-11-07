function onDepositCoin(transaction) {
  validateAmount(transaction.amount)

  var vault = transaction.vault
  vault.amount += transaction.amount

  var newTransaction = getFactory().newConcept('com.genxas.coin.network', 'Transaction')
  newTransaction.amount = transaction.amount
  newTransaction.type = "DEPOSIT"

  if (vault.transactions) {
    vault.transactions.push(newTransaction)
  } else {
    vault.transactions = [newTransaction]
  }

  return getAssetRegistry('com.genxas.coin.network.Vault')
    .then(function (assetRegistry) {
      return assetRegistry.update(vault)
    })
}

function onWithdrawCoin(transaction) {
  validateAmount(transaction.amount)

  var vault = transaction.vault

  if (vault.amount < transaction.amount) {
    throw new Error('Insufficient fund')
  }

  vault.amount -= transaction.amount

  var newTransaction = getFactory().newConcept('com.genxas.coin.network', 'Transaction')
  newTransaction.amount = transaction.amount
  newTransaction.type = "WITHDRAW"

  if (vault.transactions) {
    vault.transactions.push(newTransaction)
  } else {
    vault.transactions = [newTransaction]
  }

  return getAssetRegistry('com.genxas.coin.network.Vault')
    .then(function (assetRegistry) {
      return assetRegistry.update(vault)
    })
}

function onTransferCoin(transaction) {
  validateAmount(transaction.amount)

  if (transaction.sender.amount < transaction.amount) {
    throw new Error('Insufficient fund')
  }

  transaction.sender.amount -= transaction.amount
  transaction.receiver.amount += transaction.amount

  // Chain style
  //
  // return getAssetRegistry('com.genxas.coin.network.Vault')
  //   .then(function (assetRegistry) {
  //     return assetRegistry.update(transaction.sender)
  //   })
  //   .then(function () {
  //     return getAssetRegistry('com.genxas.coin.network.Vault')
  //   })
  //   .then(function (assetRegistry) {
  //     return assetRegistry.update(transaction.receiver)
  //   })

  return getAssetRegistry('com.genxas.coin.network.Vault')
    .then(function (assetRegistry) {
      return assetRegistry.updateAll([transaction.sender, transaction.receiver])
    })
}

function validateAmount(amount) {
  if (amount < 0) {
    throw new Error('Invalid amount')
  }
}
