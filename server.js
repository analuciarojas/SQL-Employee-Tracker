// Dependencies
require('dotenv').config();
const mysql = require('mysql');
const inquier = require('inquirer');
const figlet = require('figlet');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.DB_PW,
  database: 'employees_DB',
});

// Connect to Database
connection.connect((err) => {
  if (err) throw err;

  console.log(`connected as id ${connection.threadId}\n`);
  
  figlet('Employee tracker', function(err, data) {
    if (err) {
      console.log('ascii art not loaded');
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

      query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
      R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
      FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
      LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
      LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id;`;
  
    }
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res);
  
      startPrompt();
    });
  };
  
