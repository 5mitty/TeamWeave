INSERT INTO department (name)
VALUES ('Maintenence'),
       ('HR'),
       ('Engineering'),
       ('Finance'),
       ('Data'),
       ('Logistics'),
       ('C-Suite');
       
INSERT INTO role (title, salary, department_id)
VALUES ('Security', 40000, 1),
       ('Front Desk', 35000, 1),
       ('Janitor', 35000, 1),
       ('HR Head', 70000, 2),
       ('HR Assistant', 50000, 2),
       ('Hardware Engineer', 125000, 3),
       ('Jr Hardware Engineer', 120000, 3),
       ('CPA', 140000, 4),
       ('CPA Assistant', 80000, 4),
       ('Jr Data Engineer', 90000, 5),
       ('Sn Data Engineer', 150000, 5),
       ('Logistics Lead', 110000, 6),
       ('CEO', 1000000, 7);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Arnold', 'Pashwoski', 6, NULL),
       ('Susanne', 'Summerberg', 4, NULL),
       ('Pete', 'Caldwell', 5, 2),
       ('Nancy', 'Taskeri', 13, NULL),
       ('Bob', 'Oberto', 9, NULL),
       ('Stacy', 'Moctre', 10, 5);


SELECT id, name AS Department FROM department

