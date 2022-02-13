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
        "View Employees by manager", 
        "Add Employee",
        "Add Department",
        "Add Role",
        "Update Employee Role",
        "Update Employee Manager",
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
        case "View Employees by manager":
        viewEmployeeByManager();
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
        updateemployeeRole();
        break;
        case "Update Employee Manager":
        updateManager();
        break;
       case "Delete a Department":
        deleteDepartment();
        break;
        //
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

  // View employees by manager
const viewEmployeeByManager =  () => {
    // Gather employee info
    connection.query("SELECT * FROM EMPLOYEE", (err, emplRes) => {
      if (err) throw err;
        // Empty employee object
      const employeeChoice = [{
        name: 'NULL',
        value: 0
      }];
      emplRes.forEach(({ first_name, last_name, id }) => {
        employeeChoice.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
       // Questions for view manager's employees
      let questions = [
        {
          type: "list",
          name: "manager_id",
          choices: employeeChoice,
           message: "What manager's employees do you want to see?"
        },
      ]
    
      // Show questions
      inquier.prompt(questions)
        .then(response => {
          let manager_id, query;
          if (response.manager_id) {
            query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
            R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
            FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
            LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
            LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id
            WHERE E.manager_id = ?;`;
          } else {
            manager_id = null;
            query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
            R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
            FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
            LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
            LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id
            WHERE E.manager_id is null;`;
          }
          connection.query(query, [response.manager_id], (err, res) => {
            if (err) throw err;
            if(res!=''){
                console.table(res);
            }
            else{
                console.log('This employee is not a manager');
            }
            startPrompt();
          });
        })
        .catch(err => {
          console.error(err);
        }); 
    });
  }

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

  // Updating role with employee
const updateemployeeRole = () => {
    // Gather employee info to choose which to modify 
    connection.query("SELECT * FROM EMPLOYEE", (err, emplRes) => {
      if (err) throw err;
      // Empty employee array
      const employeeChoice = [];
      emplRes.forEach(({ first_name, last_name, id }) => {
        employeeChoice.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
      
    // Gather role info to modify
        connection.query("SELECT * FROM ROLE", (err, rolRes) => {
        if (err) throw err;
        // Empty role array
        const roleChoice = [];
        rolRes.forEach(({ title, id }) => {
          roleChoice.push({
            name: title,
            value: id
            });
          });
        
        // Questions to modify role

        let questions = [
          {
            type: "list",
            name: "id",
            choices: employeeChoice,
            message: "Which employee's role do you want to update?"
          },
          {
            type: "list",
            name: "role_id",
            choices: roleChoice,
            message: "Whay will be the employee's new role?"
          }
        ]
    // Show questions
    inquier.prompt(questions)
          .then(response => {
            const query = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
            connection.query(query, [
              {role_id: response.role_id},
              "id",
              response.id
            ], (err) => {
              if (err) throw err;
              
              console.log("Congrats! We could succesfully update employee's role!");
              startPrompt();
            });
          })
          .catch(err => {
            console.error(err);
          });
        })
    });
  }

  // Updating manager of employee
const updateManager = ()=> {
    // Gather employee info for user to choose from
    connection.query("SELECT * FROM EMPLOYEE", (err, emplRes) => {
      if (err) throw err;
      // Empty employee array
      const employeeChoice = [];
      emplRes.forEach(({ first_name, last_name, id }) => {
        employeeChoice.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
      // If employee has no manager
      
      const managerChoice = [{
        name: 'NULL',
        value: 0
      }]; 
      emplRes.forEach(({ first_name, last_name, id }) => {
        managerChoice.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
    // Questions for updating manager

      let questions = [
        {
          type: "list",
          name: "id",
          choices: employeeChoice,
          message: "Who's employee manager do you want to update?"
        },
        {
          type: "list",
          name: "manager_id",
          choices: managerChoice,
          message: "Who is their new manager?"
        }
      ]

      //Show questions
    
      inquier.prompt(questions)
        .then(response => {
          const query = `UPDATE EMPLOYEE SET ? WHERE id = ?;`;
          let manager_id = response.manager_id !== 0? response.manager_id: null;
          connection.query(query, [
            {manager_id: manager_id},
            response.id
          ], (err, res) => {
            if (err) throw err;
              
            console.log("Congrats! We succesfully updated the manager");
            startPrompt();
          });
        })
        .catch(err => {
          console.error(err);
        });
    })
    
  };

  // Delete department
const deleteDepartment = () => {
    // Empty department array;
    const departments = [];

    // Gather department info
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
      if (err) throw err;
  
      res.forEach(dep => {
        let qObj = {
          name: dep.name,
          value: dep.id
        }

        // Populate departments array 
        departments.push(qObj);
      });

      // Questions for what department to delete
  
      let questions = [
        {
          type: "list",
          name: "id",
          choices: departments,
          message: "Which department do you want to delete?"
        }
      ];
       
      // Show questions
      inquier.prompt(questions)
      .then(response => {
        const query = `DELETE FROM DEPARTMENT WHERE id = ?`;
        connection.query(query, [response.id], (err, res) => {
          if (err) throw err;
          console.log(`Congrats! We succesfully deleted the department ${res.affectedRows}`);
          startPrompt();
        });
      })
      .catch(err => {
        console.error(err);
      });
    });
  };