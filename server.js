// Dependencies
const mysql = require('mysql2');
const inquier = require('inquirer');
const figlet = require('figlet');
require("dotenv").config();


// Create MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: process.env.PORT || 3306,
  user: 'root',
  dialect: "mysql",
  password: process.env.DB_PW,
  database: 'employees_DB',
});

// Connect to Database
connection.connect((err) => {
  if (err) throw err;

  console.log(`connected as id ${connection.threadId}\n`);
  
  figlet('Employee tracker', function(err, data) {
    if (err) {
      console.log('ascii art not working');
    } else {
      console.log(data);
    }  

    // Runs the application
    startPrompt();
  });
});

function startPrompt() {
    // What action user wants to do 
  const startQuestion = [{
    type: "list",
    name: "action",
    message: "Would you like to do?",
    loop: false,
    choices: [
        "View All Employees",
        "View All Roles",
        "View All Departments",
        "Add Employee",
        "Add Department",
        "Add Role",
        "Update Employee Role",
        "Update Employee Manager",
        "View Employees by manager", 
        "Delete a Department", 
        "Delete a Role", 
        "Delete an Employee", 
        "View Total Budget of a Department", 
        "Exit"]
  }]

    // Start prompts
  inquier.prompt(startQuestion)
  .then(response => {
    switch (response.action) {
        case "View All Employees":
        viewAll("employees");
        break;
        case "View All Roles":
        viewAll("roles");
        break;
        case "View All Departments":
        viewAll("departments");
        break;
        case "Add Employee":
        addNewEmployee();
        break;      
        case "Add Department":
        addNewDepartment();
        break;
        case "Add Role":
        addNewRole();
        break;
        case "Update Employee Role":
        updateRole();
        break;
        case "View Employees by manager":
        viewEmployeeByManager();
        break;
        case "Update Employee Manager":
        updateManager();
        break;
        case "Delete a Department":
        deleteDepartment();
        break;
        case "Delete a Role":
        deleteRole();
        break;
        case "Delete an Employee":
        deleteEmployee();
        break;
        case "View Total Budget of a Department":
        viewBudget();
        break;
        default:
        connection.end();
    }
  })
  .catch(err => {
    console.error(err);
  });
}

// View all roles, employees or departments 
const viewAll = (table) => {
    let query;
    if (table === "departments") {
        console.log("VIEWING DEPARTMENTS\n");

      query = `SELECT * FROM DEPARTMENT`;
    } else if (table === "roles") {
        console.log("VIEWING ROLES\n");

      query = `SELECT R.id AS id, title, salary, D.name AS department
      FROM ROLE AS R LEFT JOIN DEPARTMENT AS D
      ON R.department_id = D.id;`;
    } else {// Default employees
        console.log("VIEWING EMPLOYEES\n");

      query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`;
  
    }
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res);
  
      startPrompt();
    });
  };
  
