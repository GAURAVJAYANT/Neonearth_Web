# NE Automation Project

This project is a Playwright-based automated testing suite for web applications. It uses Allure for reporting and includes configurations for various environments and browsers.

---

# 🚀 Getting Started

## Prerequisites

Before you begin, ensure the following tools are installed on your system:

- [Git](https://git-scm.com/downloads) (required for cloning the repository)
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Antigravity](https://antigravity.google/) (to run tests in local dev environment)
- An IDE such as: (If don't want to use Antigravity)
  - [Visual Studio Code](https://code.visualstudio.com/)
  - IntelliJ IDEA
  - WebStorm

---

## 👥 Request Project Access

Before cloning the repository, ask **Himanshu Chhabra** to add you as a member of the GitLab project.

Once access is granted, log in to your GitLab account and verify that you can see the repository.

---

# 🔑 SSH Setup for GitLab

## 1. Open Your IDE Terminal

Open your preferred IDE and launch the integrated terminal.

### Example in VS Code
- Open VS Code
- Navigate to:

```text
Terminal → New Terminal
```

A terminal window will open at the bottom of the IDE.

---

## 2. Check for Existing SSH Keys

Copy and paste the following command into the terminal:

```bash
ls -al ~/.ssh
```

Press **Enter**.

Look for existing SSH key files such as:

```bash
id_ed25519
id_ed25519.pub
```

If these files already exist, you can either:
- Use the existing SSH key
- Or generate a new SSH key

---

## 3. Generate a New SSH Key

Copy and paste the following command into the terminal:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Replace:

```text
your_email@example.com
```

with your GitLab email address.

### Example

```bash
ssh-keygen -t ed25519 -C "john.doe@gmail.com"
```

Press **Enter**.

You will see:

```text
Enter file in which to save the key:
```

Simply press **Enter** again to save it to the default location:

```bash
~/.ssh/id_ed25519
```

Next, you may see:

```text
Enter passphrase (empty for no passphrase):
```

- You can either:
  - Enter a secure passphrase
  - Or press **Enter** to skip

After successful generation, you should see output similar to:

```text
Your identification has been saved in ~/.ssh/id_ed25519
Your public key has been saved in ~/.ssh/id_ed25519.pub
```

---

## 4. Start SSH Agent

Copy and paste the following command into the terminal:

```bash
eval $(ssh-agent -s)
```

Press **Enter**.

You should see output similar to:

```text
Agent pid 1234
```

---

## 5. Add SSH Key to SSH Agent

Copy and paste the following command into the terminal:

```bash
ssh-add ~/.ssh/id_ed25519
```

Press **Enter**.

You should see:

```text
Identity added: ~/.ssh/id_ed25519
```

---

## 6. Copy SSH Public Key

Copy and paste the following command into the terminal:

```bash
cat ~/.ssh/id_ed25519.pub
```

Press **Enter**.

The terminal will display your SSH public key.

### Example Output

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBExampleKey your_email@example.com
```

### Copy the Entire Output

- Select the complete output shown in the terminal

---

## 7. Add SSH Key to GitLab

1. Log in to GitLab.
2. Click your profile icon.
3. Navigate to:

```text
Preferences → SSH Keys
```

4. Paste the copied SSH key into the **Key** field.
5. Add a title such as:

```text
Work Laptop
```

6. Click **Add key**.

---

## 8. Test SSH Connection

Copy and paste the following command into the terminal:

```bash
ssh -T git@gitlab.com
```

Press **Enter**.

The first time you connect, you may see:

```text
Are you sure you want to continue connecting (yes/no)?
```

Type:

```text
yes
```

and press **Enter**.

If successful, you should see:

```text
Welcome to GitLab, @yourusername!
```

---

# 📥 Clone the Repository

After SSH setup is complete, clone the repository using:

```bash
git clone git@gitlab.com:himanshuchhabra/ne-automation.git
```

Navigate into the project folder:

```bash
cd ne-automation
```

---

# 🛠️ Installation

Install project dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

---

# ⚙️ Configuration

## 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

## 2. Update Environment Variables

Open the `.env` file and update required variables such as:

- `BASE_URL`
- `BROWSER`
- `HEADLESS`

---

# 🧪 Running Tests

## Run all tests in headless mode

```bash
npm test
```

## Run tests in headed mode

```bash
npm run test:headed
```

---

# 📊 Reporting

## Generate Allure Report

```bash
npm run allure:generate
```

## Open Allure Report

```bash
npm run allure:open
```

## Clean Old Results

```bash
npm run allure:clean
```

---

# 🏗️ Project Structure

- `tests/` → Playwright test scripts
- `pages/` → Page Object Model (POM) files
- `utils/` → Utility functions and helpers
- `data/` → Test data including `login_data.xlsx`
- `playwright.config.js` → Main Playwright configuration
- `globalSetup.js` → Handles pre-test authentication

---