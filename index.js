const {ipcRenderer, shell} = require('electron')
var coins = ['BTC','ETH', 'LTC', 'DASH', 'ZEC', 'XRP']
var currency = 'BTC'
var usercrypto = 'BTC'


document.addEventListener('click', (event) => {
  if (event.target.href) {
    // Open links in external browser
    shell.openExternal(event.target.href)
    event.preventDefault()
  } else if (event.target.classList.contains('js-refresh-action')) {
    update()
  } else if (event.target.classList.contains('js-quit-action')) {
    window.close()
  } else if (event.target.classList.contains('tab-item')) {
    switchLocalCurrency(event)
  }
})



function init() {
  update()

  var coinElems = document.querySelectorAll('.coin')
  for (var i = 0; i < coinElems.length; i++) {
    coinElems[i].addEventListener('click', function() {
      switchCrypto(this)
    })
  }
}

function update() {
  for (var i = 0; i < coins.length; i++) {
    updateCrypto(coins[i])
  }
}

const updateCrypto = (coin) => {
  // const url = `https://api.coindesk.com/v1/bpi/currentprice.json`
  const url = `https://min-api.cryptocompare.com/data/price?fsym=${coin}&tsyms=BTC&e=binance`

  fetch(url)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Error: ' +  response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(function(crypto) {
        if ( coin === usercrypto) {
          ipcRenderer.send('crypto-updated', crypto, currency, usercrypto)
        }

        updateView(coin, crypto)
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error:', err);
  });


}

const updateView = (coin, crypto) => {
  document.querySelector('.js-summary').textContent = ''
  document.querySelector(`.${coin}-js-usd`).textContent = `$${crypto.BTC}`
    document.querySelector(`.${coin}-js-eur`).textContent = `€${crypto.ETH}`

}


function switchLocalCurrency(event) {
  var tabs = document.querySelectorAll('.tab-item')
  var local = event.target.dataset.currency
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active')
  }
  event.target.classList.add('active')
  currency = local
  update()
}

function switchCrypto(elem) {
  var currencies = document.querySelectorAll('.coin')
  var curr = elem.dataset.coin
  for (var i = 0; i < currencies.length; i++) {
    currencies[i].classList.remove('active')
  }
  elem.classList.add('active')
  usercrypto = curr
  update()
}

function checkVersion() {
  fetch('https://raw.githubusercontent.com/chrisunderdown/bitdock/master/package.json')
  .then(
    function(response) {
      response.json().then(function(pkg) {
        const version = pkg.version
        console.log(version)
        ipcRenderer.send('check-version', version)
      })
    }
  )
}

ipcRenderer.on('show-update', function (event) {
  var dialog = document.querySelector('.update')
  dialog.classList.add('show')
})


// Refresh currency every second
setInterval(update, 1000)
// Check version every minute
setInterval(checkVersion, 60000)
// Update initial currency when loaded
document.addEventListener('DOMContentLoaded', init)
