// Dependencies
const mysql = require('mysql2');
const inquier = require('inquirer');
const figlet = require('figlet');
require("dotenv").config();
require('console.table');

// Create MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: process.env.PORT || 3306,
  user: 'root',
  dialect: "mysql",
  password: process.env.DB_PW,
  database: 'employee_DB',
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
        addEmployee();
        break;      
        case "Add Department":
        addDepartment();
        break;
        case "Add Role":
        addRole();
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
        query = `SELECT * FROM ROLE`;

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

  // Add employee to the database 
const addEmployee = () => {

    // Gather employee info to choose manager
    connection.query("SELECT * FROM EMPLOYEE", (err, employeeRes) => {
      if (err) throw err;
      // Create empty employee const
      const employeeChoice = [
        {
          name: 'NULL',
          value: 0
        }
      ];

     // Employee can have NULL manager
      employeeRes.forEach(({ first_name, last_name, id }) => {
        employeeChoice.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
      
      // Get roles to choose what new employee's role
      connection.query("SELECT * FROM ROLE", (err, roleRes) => {
        if (err) throw err;
        
        // Create empty Role array
        const roleChoice = [];
        roleRes.forEach(({ title, id }) => {
          roleChoice.push({
            name: title,
            value: id
            });
          });
        
        // Questions for new employee basic info
       
        let questions = [
          {
            type: "input",
            name: "first_name",
            message: "What is the employee's first name?"
          },
          {
            type: "input",
            name: "last_name",
            message: "What is the employee's last name?"
          },
          {
            type: "list",
            name: "role_id",
            choices: roleChoice,
            message: "What is the employee's role?"
          },
          {
            type: "list",
            name: "manager_id",
            choices: employeeChoice,
            message: "Who is the employee's manager? (Could be null)"
          }
        ]

        // Show questions
    
        inquier.prompt(questions)
          .then(response => {
            const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
            let manager_id = response.manager_id !== 0? response.manager_id: null;
            connection.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
              if (err) throw err;
              console.log(`Congrats! We could succesfully insert employee ${response.first_name} ${response.last_name} with ID ${res.insertId}`);
              startPrompt();
            });
          })
          .catch(err => {
            console.error(err);
          });
      })
    });
  }

  // Adding new department to database
const addDepartment = () => {
    // Department question
    let questions = [
      {
        type: "input",
        name: "name",
        message: "what is the new department name?"
      }
    ];
  
    inquier.prompt(questions)
    .then(response => {
        // Add department to other departments
      const query = `INSERT INTO department (name) VALUES (?)`;
      connection.query(query, [response.name], (err, res) => {
        if (err) throw err;
        console.log(`Congrats! We could succesfully insert ${response.name} as a new department with ID ${res.insertId}`);
        startPrompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  }

  // Adding new role to database
const addRole = () => {
    // Create empty department array
    const departments = [];
    // Gather department info for user to choose from
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
      if (err) throw err;
  
      res.forEach(dep => {
        // Departments with ID
        let qObj = {
          name: dep.name,
          value: dep.id
        }
        departments.push(qObj);
      });
  
    // Questions for new role
    let questions = [
        {
          type: "input",
          name: "title",
          message: "What is the title of the new role?"
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary of the new role?"
        },
        {
          type: "list",
          name: "department",
          choices: departments,
          message: "Which department is this role in?"
        }
    ];
    // Show questions

      inquier.prompt(questions)
      .then(response => {
        const query = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
        connection.query(query, [[response.title, response.salary, response.department]], (err, res) => {
          if (err) throw err;
          console.log(`Congrats! We could succesfully insert ${response.title} role at ID ${res.insertId}`);
          startPrompt();
        });
      })
      .catch(err => {
        console.error(err);
      });
    });
  }