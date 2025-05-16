DSC System: Installations and Deployments

Installations

Update WSL/Ubuntu:
sudo apt update && sudo apt upgrade -y

Install Rust:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

Install Node.js and npm:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

Install Yarn:
npm install -g yarn

If permission errors:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g yarn


Install Solana CLI:
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2


Install Anchor CLI:
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest


Install Mocha:
npm install -g mocha


Set Up Project:
mkdir ~/projects
cd ~/projects
anchor init dsc-system
cd dsc-system
yarn install

If yarn install fails:
yarn cache clean
yarn config set registry https://registry.npmjs.org
yarn install



Deployments


Configure Files:

Update Anchor.toml, Cargo.toml, programs/dsc-system/Cargo.toml, package.json, lib.rs, and dsc-system.ts as per the project setup (see repository or documentation).
Generate program keypair:solana-keygen new --outfile target/deploy/dsc_system-keypair.json


Update Anchor.toml and lib.rs with the program ID:solana-keygen pubkey target/deploy/dsc_system-keypair.json




Build:
anchor build


Test:
anchor test


Deploy to Devnet:
anchor deploy


Verify Deployment:
solana program show <YOUR_PROGRAM_ID>


