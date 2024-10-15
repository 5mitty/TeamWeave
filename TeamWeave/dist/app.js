import express from 'express';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { pool, connectToDb } from './connection.js';
await connectToDb();
class App {
    constructor() {
        Object.defineProperty(this, "app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.app = express();
        this.routes();
    }
    routes() {
        this.app.route("/").get((_req, res) => {
            res.send("Hello World!"); // Example response
        });
    }
}
const port = 3001;
const newApp = new App().app;
// Express middleware
newApp.use(express.urlencoded({ extended: false }));
newApp.use(express.json());
newApp.listen(port, () => {
    console.log("Server is running on port 3000");
});
// Function to display the main menu
function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Update an employee\'s manager',
                'Quit'
            ]
        }
    ])
        .then((answers) => {
        switch (answers.action) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Update an employee\'s manager':
                updateEmployeeManager();
                break;
            case 'Quit':
                console.log('Goodbye!');
                process.exit();
        }
    });
}
// Placeholder functions for each action
async function viewDepartments() {
    console.log(chalk.blue('\nViewing all departments...\n'));
    try {
        const res = await pool.query('SELECT id, name AS Department FROM department');
        // Use console.table to display the departments in a formatted table
        console.table(res.rows);
        console.log('\n'); // Add a blank line after displaying departments
    }
    catch (err) {
        console.error(chalk.red('Error viewing departments:', err));
    }
    // Return to main menu after viewing departments
    await mainMenu();
}
async function viewRoles() {
    console.log(chalk.blue('\nViewing all roles...\n'));
    try {
        const result = await pool.query('SELECT r.id, r.title AS Role, r.salary AS Salary, d.name AS Department FROM role r JOIN department d ON r.department_id = d.id');
        // Use console.table to display the roles in a formatted table
        console.table(result.rows);
        console.log('\n'); // Add a blank line after displaying roles
    }
    catch (err) {
        console.error(chalk.red('Error viewing roles:', err));
    }
    // Return to main menu after viewing roles
    await mainMenu();
}
async function viewEmployees() {
    console.log(chalk.blue('\nViewing all employees...\n'));
    try {
        const result = await pool.query(`
            SELECT e.id, e.first_name AS First, e.last_name AS Last, r.title AS Role, d.name AS Department, r.salary AS Salary, e.manager_id AS ManagerId
            FROM employee e
            JOIN role r ON e.role_id = r.id
            JOIN department d ON r.department_id = d.id
        `);
        // Use console.table to display the employees in a formatted table
        console.table(result.rows);
        console.log('\n'); // Add a blank line after displaying employees
    }
    catch (err) {
        console.error(chalk.red('Error viewing employees:', err));
    }
    // Return to main menu after viewing employees
    await mainMenu();
}
async function addDepartment() {
    console.log(chalk.blue('\nAdding a department...\n'));
    const { departmentName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'What department would you like to add?',
        },
    ]);
    try {
        // Check if the department already exists
        const existingDepartment = await pool.query('SELECT * FROM department WHERE name = $1', [departmentName]);
        if (existingDepartment.rows.length > 0) {
            console.log(chalk.red(`Department "${departmentName}" already exists. Closing Application...`));
            //return; // Exit the function if the department exists
            return;
        }
        // Insert the new department into the database
        await pool.query('INSERT INTO department(name) VALUES($1)', [departmentName]);
        console.log(chalk.green(`Department added: ${departmentName}\n`));
    }
    catch (err) {
        console.error(chalk.red('Error adding department:', err));
    }
    console.log('\n'); // Add a blank line after adding a department
    await mainMenu(); // Return to main menu
}
async function addRole() {
    console.log(chalk.blue('Adding a role...'));
    try {
        // Fetch departments from the database
        const res = await pool.query('SELECT id, name FROM department');
        const departments = res.rows;
        // Prompt user for role details
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the title of the role?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary for this role?',
                validate: (input) => {
                    const isNumber = !isNaN(Number(input));
                    return isNumber || 'Please enter a valid number';
                },
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Which department does this role belong to?',
                choices: departments.map(department => ({
                    name: department.name,
                    value: department.id
                })),
            }
        ]);
        const { title, salary, department_id } = answers;
        // SQL query to insert the new role
        const query = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *';
        const values = [title, salary, department_id];
        const result = await pool.query(query, values);
        console.log(chalk.green(`Role added: ${result.rows[0].title}`));
    }
    catch (err) {
        console.error(chalk.red('Error adding role:', err));
    } //finally {
    // Close the database connection if necessary
    // pool.end(); // Uncomment if you want to close the pool here
    //}
    console.log('\n'); // Add a blank line after adding a role
    await mainMenu(); // Return to main menu
}
async function addEmployee() {
    console.log(chalk.blue('\nAdding an employee...\n'));
    try {
        // Fetch roles and managers from the database
        const rolesResult = await pool.query('SELECT id, title FROM role');
        const managersResult = await pool.query('SELECT id, first_name, last_name FROM employee');
        const roles = rolesResult.rows;
        const managers = managersResult.rows;
        // Prompt user for employee details
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'What is the employee\'s first name?',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'What is the employee\'s last name?',
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'What is the employee\'s role?',
                choices: roles.map(role => ({
                    name: role.title,
                    value: role.id
                })),
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Who is the employee\'s manager?',
                choices: [
                    ...managers.map(manager => ({
                        name: `${manager.first_name} ${manager.last_name}`,
                        value: manager.id
                    })),
                    { name: 'None', value: null } // Option for no manager
                ],
            }
        ]);
        // SQL query to insert the new employee
        const query = `
            INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [answers.firstName, answers.lastName, answers.roleId, answers.managerId];
        const result = await pool.query(query, values);
        console.log(chalk.green(`Employee added: ${result.rows[0].first_name} ${result.rows[0].last_name}`));
    }
    catch (err) {
        console.error(chalk.red('Error adding employee:', err));
    }
    console.log('\n'); // Add a blank line after adding an employee
    await mainMenu(); // Return to main menu
}
async function updateEmployeeRole() {
    console.log(chalk.blue('\nUpdating an employee role...\n'));
    try {
        // Fetch employees and roles from the database
        const employeesResult = await pool.query('SELECT id, first_name, last_name FROM employee');
        const rolesResult = await pool.query('SELECT id, title FROM role');
        const employees = employeesResult.rows;
        const roles = rolesResult.rows;
        // Prompt user to select an employee and a new role
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee\'s role would you like to update?',
                choices: employees.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                })),
            },
            {
                type: 'list',
                name: 'newRoleId',
                message: 'What is the new role for the employee?',
                choices: roles.map(role => ({
                    name: role.title,
                    value: role.id
                })),
            }
        ]);
        // SQL query to update the employee's role
        const query = 'UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *';
        const values = [answers.newRoleId, answers.employeeId];
        const result = await pool.query(query, values);
        console.log(chalk.green(`Employee role updated: ${result.rows[0].first_name} ${result.rows[0].last_name} is now a ${roles.find(role => role.id === answers.newRoleId)?.title}.`));
    }
    catch (err) {
        console.error(chalk.red('Error updating employee role:', err));
    }
    console.log('\n'); // Add a blank line after updating an employee role
    await mainMenu(); // Return to main menu
}
async function updateEmployeeManager() {
    console.log(chalk.blue('\nUpdating an employee\'s manager...\n'));
    try {
        // Fetch employees from the database
        const employeesResult = await pool.query('SELECT id, first_name, last_name FROM employee');
        const managersResult = await pool.query('SELECT id, first_name, last_name FROM employee');
        const employees = employeesResult.rows;
        // Prompt user to select an employee to update
        const { employeeId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee\'s manager do you want to update?',
                choices: employees.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }))
            }
        ]);
        // Prompt user to select a new manager for the employee
        const { newManagerId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'newManagerId',
                message: 'Who is the employee\'s new manager?',
                choices: [
                    ...managersResult.rows.map(manager => ({
                        name: `${manager.first_name} ${manager.last_name}`,
                        value: manager.id
                    })),
                    { name: 'None', value: null } // Option for no manager
                ]
            }
        ]);
        // SQL query to update the employee's manager
        const query = `UPDATE employee SET manager_id = $1 WHERE id = $2 RETURNING *`;
        const values = [newManagerId, employeeId];
        const result = await pool.query(query, values);
        console.log(chalk.green(`Employee's manager updated: ${result.rows[0].first_name} ${result.rows[0].last_name} now reports to ${newManagerId ? newManagerId : 'no manager'}.`));
    }
    catch (err) {
        console.error(chalk.red('Error updating employee manager:', err));
    }
    console.log('\n'); // Add a blank line after updating an employee's manager
    await mainMenu(); // Return to main menu
}
// Start the application
mainMenu();
