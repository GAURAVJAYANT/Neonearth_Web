@echo off
SET JAVA_HOME=
echo Opening Allure Report on port 9414...
"C:\Program Files\nodejs\npx.cmd" allure serve allure-results -p 9414
