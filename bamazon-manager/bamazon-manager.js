
var inquirer = require('inquirer');
var mysql = require('mysql');
var cTable = require('console.table');


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bamazon'
});

function promptManager() {
  
  inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Please select an option:',
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
      filter: function (val) {
        if (val === 'View Products for Sale') {
          return 'sale';
        } else if (val === 'View Low Inventory') {
          return 'lowInventory';
        } else if (val === 'Add to Inventory') {
          return 'addInventory';
        } else if (val === 'Add New Product') {
          return 'newProduct';
        }
      }
    }
  ]).then(function(input) {
    
    if (input.option ==='sale') {
      displayInventory();
    } else if (input.option === 'lowInventory') {
      displayLowInventory();
    } else if (input.option === 'addInventory') {
      addInventory();
    } else if (input.option === 'newProduct') {
      createNewProduct();
    }
  })
}


function displayInventory() {
  
  queryString = 'SELECT * FROM products';

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
      chartData += 'Price: $' + data[i].price + '  //  ';
      chartData += 'Quantity: ' + data[i].stock_quanity + '\n';

      console.log(chartData);
    }

      console.log("---------------------------------------------------------------------\n");

    
    connection.end();
  })
}


function displayLowInventory() {
  
  queryString = 'SELECT * FROM products WHERE stock_quanity < 20';

  
  connection.query(queryString, function(err, data) {
    if (err) throw err;

    console.log('Low Inventory Items (below 20): ');
    console.log('................................\n');

    var chartData = '';
    for (var i = 0; i < data.length; i++) {
      chartData = '';
      chartData += 'Item ID: ' + data[i].item_id + '  //  ';
      chartData += 'Product Name: ' + data[i].product_name + '  //  ';
      chartData += 'Department: ' + data[i].department_name + '  //  ';
      chartData += 'Price: $' + data[i].price + '  //  ';
      chartData += 'Quantity: ' + data[i].stock_quanity + '\n';

      console.log(chartData);
    }

      console.log("---------------------------------------------------------------------\n");
    connection.end();
  })
}

function validateInteger(value) {
  var integer = Number.isInteger(parseFloat(value));
  var sign = Math.sign(value);

  if (integer && (sign === 1)) {
    return true;
  } else {
    return 'Please enter a whole non-zero number.';
  }
}


function validateNumeric(value) {
  
  var number = (typeof parseFloat(value)) === 'number';
  var positive = parseFloat(value) > 0;

  if (number && positive) {
    return true;
  } else {
    return 'Please enter a positive number for the unit price.'
  }
}


function addInventory() {
  
  inquirer.prompt([
    {
      type: 'input',
      name: 'item_id',
      message: 'Please enter the Item ID for stock_count update.',
      validate: validateInteger,
      filter: Number
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'How many would you like to add?',
      validate: validateInteger,
      filter: Number
    }
  ]).then(function(input) {

    var item = input.item_id;
    var addQuantity = input.quantity;

    
    var queryStr = 'SELECT * FROM products WHERE ?';

    connection.query(queryStr, {item_id: item}, function(err, data) {
      if (err) throw err;

      if (data.length === 0) {
        console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
        addInventory();

      } else {
        var productData = data[0];

        console.log('Updating Inventory...');

        var updateQueryStr = 'UPDATE products SET stock_quanity = ' + (productData.stock_quanity + addQuantity) + ' WHERE item_id = ' + item;
        
        connection.query(updateQueryStr, function(err, data) {
          if (err) throw err;

          console.log('Stock count for Item ID ' + item + ' has been updated to ' + (productData.stock_quanity + addQuantity) + '.');
          console.log("\n---------------------------------------------------------------------\n");

          
          connection.end();
        })
      }
    })
  })
}


function createNewProduct() {
  
  inquirer.prompt([
    {
      type: 'input',
      name: 'product_name',
      message: 'Please enter the new product name.',
    },
    {
      type: 'input',
      name: 'department_name',
      message: 'Which department does the new product belong to?',
    },
    {
      type: 'input',
      name: 'price',
      message: 'What is the price per unit?',
      validate: validateNumeric
    },
    {
      type: 'input',
      name: 'stock_quanity',
      message: 'How many items are in stock?',
      validate: validateInteger
    }
  ]).then(function(input) {
    // console.log('input: ' + JSON.stringify(input));

    console.log('Adding New Item: \n    product_name = ' + input.product_name + '\n' +  
                     '    department_name = ' + input.department_name + '\n' +  
                     '    price = ' + input.price + '\n' +  
                     '    stock_quantity = ' + input.stock_quanity);

    // Create the insertion query string
    var queryString = 'INSERT INTO products SET ?';

    // Add new product to the db
    connection.query(queryString, input, function (error, results, fields) {
      if (error) throw error;

      console.log('New product has been added to the inventory under Item ID ' + results.insertId + '.');
      console.log("\n---------------------------------------------------------------------\n");

      
      connection.end();
    });
  })
}

function runBamazon() {
  
  promptManager();
}

runBamazon();

