@echo off
SET JAVA_HOME=
echo Opening Allure Report on port 9268...
"C:\Program Files\nodejs\npx.cmd" allure serve allure-results -p 9268
