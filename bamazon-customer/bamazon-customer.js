var inquirer = require("inquirer");
var cTable = require('console.table');
var mysql = require('mysql');

//mysql conncetion
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'bamazon'
});
 

function Validate(value) {
  var integer = Number.isInteger(parseFloat(value));
  var sign = Math.sign(value);

  if (integer && (sign === 1)) {
    return true;
  } else {
    return 'Please enter a whole non-zero number.';
  }
}

function promptUserPurchase() {
  
  inquirer.prompt([
    {
      type: 'input',
      name: 'item_id',
      message: 'Please enter the Item ID which you would like to purchase.',
      validate: Validate,
      filter: Number
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'How many do you need?',
      validate: Validate,
      filter: Number
    }
  ]).then(function(input) {
    

    var item = input.item_id;
    var quantity = input.quantity;
    
    var queryString = 'SELECT * FROM products WHERE ?';

    connection.query(queryString, {item_id: item}, function(err, data) {
      if (err) throw err;

      if (data.length === 0) {
        console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
        displayInventory();

      } else {
        
        var productData = data[0];
        
        console.log('~~~~~ productData quantity', productData['stock_quanity']);

        
        if (quantity <= productData.stock_quanity) {
          console.log('Congratulations, the product you requested is in stock! Placing order!');

          var updateQueryString = 'UPDATE products SET stock_quanity = ' + (productData.stock_quanity - quantity) + ' WHERE item_id = ' + item;
          
          connection.query(updateQueryString, function(err, data) {
            if (err) throw err;

            console.log('Your oder has been placed! Your total is $' + productData.price * quantity);
            
            console.log("\n---------------------------------------------------------------------\n");

            promptUserAgainIfSuccess();
          })
        } else {
          console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
          console.log("\n---------------------------------------------------------------------\n");

          promptUserAgainIfFail();
        }
      }
    })
  })
}

function promptUserAgainIfFail(){
  inquirer.prompt([
    {
      name: "Purchase Again",
      type: "confirm",
      message: "Would you like to modify your order or see what else there is to purchase?",     
    }
  ]).then(function(res) {
    console.log(res);
    if (res["Purchase Again"] === true) {
      runBamazon();
    }
    else{
      console.log("Please visit us again soon. Goodbye.")
      connection.end();
    } 
  })
}

function promptUserAgainIfSuccess(){
  inquirer.prompt([
    {
      name: "Purchase Again",
      type: "confirm",
      message: "Is there anything else you would like to Purchase?",     
    }
  ]).then(function(res) {
    console.log(res);
    if (res["Purchase Again"] === true) {
      runBamazon();
    }
    else{
      console.log("Thank you for shopping with Bamazon!! Goodbye!")
      connection.end();
    } 
  })
}

function displayInventory() {

  queryString = 'SELECT * FROM products';

  // Make the db query
  connection.query(queryString, function(err, data) {
    if (err) throw err;

    console.log('Existing Inventory: ');
    console.log('...................\n');

    var chartData = '';
    for (var i = 0; i < data.length; i++) {
      chartData = '';
      chartData += 'Item ID: ' + data[i].item_id + '  //  ';
      chartData += 'Product Name: ' + data[i].product_name + '  //  ';
      chartData += 'Department: ' + data[i].department_name + '  //  ';
      chartData += 'Price: $' + data[i].price + '\n';

      console.log(chartData);
    }

      console.log("---------------------------------------------------------------------\n");

      promptUserPurchase();
  })
}


function runBamazon() {
  
  displayInventory();
}

runBamazon();