USE employee_DB;

INSERT INTO department (name)
VALUES ("Engineering"),
        ("Finance"),
        ("Marketing"),
        ("Sales"),
        ("Legal");

SELECT * FROM department;

INSERT INTO role (title, salary, department_id)
VALUES ("Software Engineer", 120000, 1),
        ("Project Manager", 140000, 1),
        ("Lead Engineer", 150000, 1),
        ("Accountant", 125000, 2),
        ("Account Manager", 160000, 2),
        ("Marketing Manager", 50000, 3),
        ("Marketing Lead", 140000, 3),
        ("Sales Rep", 85000, 4),
        ("Salesperson", 80000, 4),
        ("Legal Team Lead", 250000, 5),
        ("Lawyer", 190000, 5);

SELECT * FROM role;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Mike", "Chan", 9, NULL),
    ("Ashley", "Rodriguez", 3, NULL),
    ("Kevin", "Tupik", 1, 2),
    ("Kunal", "Singh", 5, NULL),
    ("Malia", "Brown", 4, 4),
    ("Sarah", "Lourd", 10, NULL),
    ("Tom", "Allen", 11, 6);


SELECT * FROM employee;


