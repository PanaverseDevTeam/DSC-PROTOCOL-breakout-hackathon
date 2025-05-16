<!-- # DSC Protocol – Breakout Hackathon

**A Dual-Hackathon Monorepo Featuring Decentralized Stablecoin Solutions**

This monorepo contains two powerful tracks under the DSC Protocol ecosystem:

1. **DSC Frontend App** — Built for Base Chain's Stablecoin Hackathon
2. **DSC Solana App** — Built for Solana Colosseum Hackathon

Both projects are designed to showcase decentralized stability solutions with AI and Web3 technology.

---

## 🏗️ Monorepo Structure

```
DSC-PROTOCOL-breakout-hackathon/
├── apps/
│   ├── dsc-frontend/        # Base Stablecoin Hackathon project
│   └── dsc-solana/          # Solana Colosseum Hackathon project
├── .gitignore
├── README.md
└── .github/workflows/      # CI/CD (coming soon)
```

---

## ⚙️ Tech Overview

| Track          | Tools & Frameworks                      |
| -------------- | --------------------------------------- |
| **Frontend**   | Next.js, TailwindCSS, Ethers.js, Vercel |
| **Solana**     | Anchor, Rust, SPL Token, Phantom Wallet |
| **Automation** | GitHub Actions (multi-app CI/CD)        |

---

## 📦 How to Run Locally

### 🖥️ Frontend (Base Chain)

```bash
cd apps/dsc-frontend
pnpm install
pnpm run dev
```

### 🔐 Solana Program (Anchor)

```bash
cd apps/dsc-solana
anchor build
anchor test
```

> Requires: Solana CLI, Anchor CLI, Rust toolchain

---

## 🚀 Features Across Both Tracks

* AI-powered liquidation engine
* Stablecoin minting & burn logic
* Interactive frontend dApp
* SPL token integration (Solana)
* Secure contract logic and validations

---

## 👨‍💻 Contributors

* **M. Yazib** — Founder of DSC | Blockchain Developer | Security Researcher | Smart Contract Auditor | Expertise in DeFi and Stable Tokens.
* **Fahad Ghouri** — Founder of Pakverse | AI & Web3 Innovator | 10+ Years Experience in Building Decentralized Systems.
* **Muhammad Mehdi** — CTO of Pakverse | Scalable Systems Engineer | AI & Web3 Solutions Architect.


## 📜 License

© 2025 DSC Protocol. All rights reserved. Licensed under custom or commercial terms.

<!-- 
---

> For inquiries, reach out via [Pakverse](https://www.linkedin.com/company/pakverse) --> -->




<!--  -->



# DSC Protocol – Breakout Hackathon

**A Hackathon Monorepo Featuring Decentralized Stablecoin Solutions**

This monorepo contains two powerful tracks under the DSC Protocol ecosystem:

1. **DSC Frontend App** 
2. **DSC Solana App** 

Both projects are designed to showcase decentralized stability solutions with AI and Web3 technology.

---

## 🏗️ Monorepo Structure

```
DSC-PROTOCOL-breakout-hackathon/
├── apps/
│   ├── dsc-frontend/        
│   └── dsc-solana/          
├── .gitignore
├── README.md
└── .github/workflows/      # CI/CD (coming soon)
```

---

## ⚙️ Tech Overview

| Track          | Tools & Frameworks                      |
| -------------- | --------------------------------------- |
| **Frontend**   | Next.js, TailwindCSS, Ethers.js, Vercel |
| **Solana**     | Anchor, Rust, SPL Token, Phantom Wallet |
| **Automation** | GitHub Actions (multi-app CI/CD)        |

---

## 📦 How to Run Locally

### 🖥️ Frontend 

```bash
cd apps/dsc-frontend
pnpm install
pnpm run dev
```

### 🔐 Solana Program 

```bash
cd apps/dsc-solana
anchor build
anchor test
```

> Requires: Solana CLI, Anchor CLI, Rust toolchain

---

## 🚀 Features Across Both Tracks

* AI-powered liquidation engine
* Stablecoin minting & burn logic
* Interactive frontend dApp
* SPL token integration (Solana)
* Secure contract logic and validations

---

## 👨‍💻 Contributors

* **M. Yazib** — Founder of DSC | Blockchain Developer | Security Researcher | Smart Contract Auditor | Expertise in DeFi and Stable Tokens.
* **Fahad Ghouri** — Founder of Pakverse | AI & Web3 Innovator | 10+ Years Experience in Building Decentralized Systems.
* **Muhammad Mehdi** — CTO of Pakverse | Scalable Systems Engineer | AI & Web3 Solutions Architect.


## ⚙️ DSC System: Installations and Deployments

### 🔧 Installations

```bash
# Update WSL/Ubuntu
sudo apt update && sudo apt upgrade -y

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
yarn global add yarn

# If permission errors:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g yarn

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest

# Install Mocha
yarn global add mocha

# Set up new Anchor project
mkdir ~/projects
cd ~/projects
anchor init dsc-system
cd dsc-system
yarn install

# If yarn install fails:
yarn cache clean
yarn config set registry https://registry.npmjs.org
yarn install
```

### 🚀 Deployments

```bash
# Configure Files
# Update Anchor.toml, Cargo.toml, programs/dsc-system/Cargo.toml, package.json, lib.rs, and dsc-system.ts as per project setup

# Generate program keypair
solana-keygen new --outfile target/deploy/dsc_system-keypair.json

# Set Program ID
solana-keygen pubkey target/deploy/dsc_system-keypair.json

# Update Anchor.toml and lib.rs accordingly

# Build, Test, Deploy
anchor build
anchor test
anchor deploy

# Verify Deployment
solana program show <YOUR_PROGRAM_ID>
```
<!-- 
## 📜 License

© 2024 DSC Protocol. All rights reserved. Licensed under custom or commercial terms.

---

> For inquiries, reach out via [Pakverse](https://www.linkedin.com/company/pakverse) -->
