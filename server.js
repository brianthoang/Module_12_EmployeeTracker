// Requirement
const inquirer = require("inquirer");
const express = require('express');
const mysql = require('mysql2');
const cTable = require("console.table");

// Code to allow user to display on localhost:3001
const PORT = process.env.PORT || 3001;
const app = express();

// Express middelware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    // add your password
    password: 'S@sukeuchiha15',
    database: 'employee_db'
  }
);

// Connect to the MySQL server and database. If no error, run startPage() function.
db.connect((err) => {
    if (err) throw err;
  });

// Welcome ASCII art
function welcomePage() {
  console.log("Welcome to: ");
  console.log(`
  ███████╗███╗░░░███╗██████╗░██╗░░░░░░█████╗░██╗░░░██╗███████╗███████╗
  ██╔════╝████╗░████║██╔══██╗██║░░░░░██╔══██╗╚██╗░██╔╝██╔════╝██╔════╝
  █████╗░░██╔████╔██║██████╔╝██║░░░░░██║░░██║░╚████╔╝░█████╗░░█████╗░░
  ██╔══╝░░██║╚██╔╝██║██╔═══╝░██║░░░░░██║░░██║░░╚██╔╝░░██╔══╝░░██╔══╝░░
  ███████╗██║░╚═╝░██║██║░░░░░███████╗╚█████╔╝░░░██║░░░███████╗███████╗
  ╚══════╝╚═╝░░░░░╚═╝╚═╝░░░░░╚══════╝░╚════╝░░░░╚═╝░░░╚══════╝╚══════╝
  
       ████████╗██████╗░░█████╗░░█████╗░██╗░░██╗███████╗██████╗░
       ╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██║░██╔╝██╔════╝██╔══██╗
       ░░░██║░░░██████╔╝███████║██║░░╚═╝█████═╝░█████╗░░██████╔╝
       ░░░██║░░░██╔══██╗██╔══██║██║░░██╗██╔═██╗░██╔══╝░░██╔══██╗
       ░░░██║░░░██║░░██║██║░░██║╚█████╔╝██║░╚██╗███████╗██║░░██║
       ░░░╚═╝░░░╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝`, " \n ");
  
  // Displays fake loading
  let duration = 0;
  let time = 100;
  let endTime = 2000;   

  var i = 0
  let interval = setInterval(() => {
      if (i == 0) {
          process.stdout.write('Connecting...');
          duration += time;
          i++
      } else if (i <= 14) {
          process.stdout.write('...');
          duration += time;
          i++
      } else if (i == 15) {
          process.stdout.write('.....Success!!!');
          duration += time;
          i++
      } else if (i >= 19) {
          process.stdout.write('');
          duration += time;
          if(duration >= endTime ){
              clearInterval(interval);
          }
      }
      }, time);
  // clears last console.log then logs again
  setTimeout(() => {
      console.log("\r\x1b[K");
      console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
      console.log('              Connected to the "employee_db" database!');
      console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n');
  }, 2300); 
  
  // short delay before showing the first prompts
  var promptInterval

  promptInterval = setInterval(function(){
      firstPrompt();
      clearInterval(promptInterval)
  }, 2600);
}

// First set of questions

function firstPrompt() {
  inquirer.prompt({
    type: "list",
    name: "task",
    message: "Would you like to do?",
    choices: [
      "View All Employees",
      "Add Employee",
      "Update Employee Role",
      "View All Roles",
      "Add Role",
      "View All Departments",
      "Add Department",
      "Quit"]
  })
  .then(function ({ task }) {
    console.log ("\nYou entered: " + task + "\n");
    switch (task) {
      case "View All Employees":
        viewEmployees();
        break;
    
      case "Add Employee":
        addEmployee();
        break;

      case "Update Employee Role":
        updateEmployeeRole();
        break;

      case "View All Roles":
        viewAllRoles();
        break;  

      case "Add Role":
        addRole();
        break;

      case "View All Departments":
        viewDepartments();
        break;

      case "Add Department":
        addDepartment();
        break;

      default:
        quit();
    }
  });
};

// Functions for the user's choices below

// View employees will join role and department tables as well as showing the manager names for each employee.
function viewEmployees() {
    let query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;";
    db.query(query, function(err, res) {
      if (err) throw err;
      console.table(res);
      firstPrompt();
    });
};

// Standard inquirer, but the last prompt will loop through and list the role titles. This function skips asking the manager_id and creates it automatically.
function addEmployee() {
  db.query('SELECT * FROM role', function (err, res) {
    if (err) throw err;
  inquirer.prompt([
    {
      name: 'first_name',
      type: 'input', 
      message: "What is the employee's first name? ",
    },
    {
      name: 'last_name',
      type: 'input', 
      message: "What is the employee's last name? "
    },
    {
      name: 'role', 
      type: 'list',
      choices: function() {
      var roleArray = [];
      for (let i = 0; i < res.length; i++) {
          roleArray.push(res[i].title);
      }
      return roleArray;
      },
      message: "What is this employee's role? "
    }
  ]).then(function (answer) {
    let role_id;
    for (let a = 0; a < res.length; a++) {
      if (res[a].title == answer.role) {
        role_id = res[a].id;
      }                  
    }  
    db.query(
    'INSERT INTO employee SET ?',
    {
      first_name: answer.first_name,
      last_name: answer.last_name,
      manager_id: role_id -1,
      role_id: role_id,
    },
    function (err) {
      if (err) throw err;
      console.log("Employee added! \n");
      firstPrompt();
    })
  });
})};

// updates employee role as well as changing the managers. If their role is a manager, then their manager_id is set to null.
function updateEmployeeRole() {
  db.query('SELECT * FROM role', function (err, res) {
    if (err) throw err;
    inquirer.prompt(
      [
        {
          type: "input",
          message: "What is the employee's ID number?",
          name: "employeeId"
        },
        {
          name: 'updateEmployeeRole', 
          type: 'list',
          choices: function() {
            var roleArray = [];
            for (let i = 0; i < res.length; i++) {
              roleArray.push(res[i].title);
            }
            return roleArray;
          },
          message: "What is this employee's new role? "
        }
      ]
    ).then(function(answer) {
      let role_id;
      for (let a = 0; a < res.length; a++) {
        if (res[a].title == answer.updateEmployeeRole) {
        role_id = res[a].id;
        }                  
      } 
      if (role_id % 2 == 0) {
        db.query('UPDATE employee SET manager_id =? WHERE ?=employee.id',[role_id -1, answer.employeeId]);
        db.query('UPDATE employee SET role_id=? WHERE ?=employee.id',[role_id, answer.employeeId],function(err, res) {
          if (err) throw err;
          console.log("Role updated. \n")
          firstPrompt();
        })
      } else {
        db.query('UPDATE employee SET manager_id = NULL WHERE ?=employee.id',[answer.employeeId]);
        db.query('UPDATE employee SET role_id=? WHERE ?=employee.id',[role_id, answer.employeeId],function(err, res) {
          if (err) throw err;
          console.log("Role updated. Employee set to manager. \n")
          firstPrompt();
        })
      }
    })
  })
};

// View all roles will change the role.department_id into department. Then it will join department table to display the department's name.
function viewAllRoles() {
  let query = "SELECT role.id, role.title, role.salary, department.name AS department FROM role LEFT JOIN department on role.department_id = department.id";
  db.query(query, function(err, res) {
    if (err) throw err;
    console.table(res);
    firstPrompt();
  });
}

// Last prompt will loop through the department names to show as choices.
function addRole() {
  db.query('SELECT * FROM department', function(err, res) {
    if (err) throw err;
  inquirer.prompt([
    {
      type: "input",
      message: "Please type the name of the role",
      name: "roleName"
    },
    {
      type: "input",
      message: "Please type the salary for this role",
      name: "roleSalary"
    },
    {
      name: "department",
      type: "list",
      message: "What department does this role belong to?",
      choices: function() {
        var roleDeptArry = [];
        for (let i = 0; i < res.length; i++) {
        roleDeptArry.push(res[i].name);
        }
        return roleDeptArry;
      },
    }
  ]).then(function (answer) {
    let department_id;
    for (let a = 0; a < res.length; a++) {
      if (res[a].name == answer.department) {
        department_id = res[a].id;
      }
    }
    db.query(
      'INSERT INTO role SET ?',
      {
        title: answer.roleName,
        salary: answer.roleSalary,
        department_id: department_id
      },
      function (err, res) {
        if(err)throw err;
        console.log('The new role has been added! \n');
        firstPrompt();
      }
    )}
  )
})
};

function viewDepartments() {
  let query = "SELECT * FROM department";
  db.query(query, function(err, res) {
    if (err) throw err;
    console.table(res);
    firstPrompt();
  });
};

function addDepartment() {
  inquirer.prompt(
    {
      type: "input",
      message: "Please type the name this new department",
      name: "newDept"
    }
  ).then(function(answer) {
    db.query("INSERT INTO department (name) VALUES (?)", [answer.newDept] , function(err,res) {
      if (err) throw err;
      console.log("A new department has been added! \n")
      firstPrompt();
    })
  })
};

// Initialize the first page.
welcomePage();

function quit() {
    console.log("Disconnected. Goodbye. \n")
    db.end();
    process.exit();
  }
module.exports = db;