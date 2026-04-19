export const SAMPLE_CONTRACTS: { label: string; code: string }[] = [
  {
    label: "Vulnerable Vault (Reentrancy)",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        
        // BUG: External call before state update (reentrancy!)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        // State updated AFTER external call
        balances[msg.sender] = 0;
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
  },
  {
    label: "Token with Overflow",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract InsecureToken {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    uint256 public totalSupply;
    address public owner;
    
    constructor(uint256 _supply) {
        owner = msg.sender;
        totalSupply = _supply;
        balances[msg.sender] = _supply;
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        // No overflow check in 0.7.x
        balances[msg.sender] -= amount;
        balances[to] += amount;
        return true;
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }
    
    function mint(address to, uint256 amount) public {
        // Missing access control — anyone can mint!
        totalSupply += amount;
        balances[to] += amount;
    }
    
    function burn(uint256 amount) public {
        balances[msg.sender] -= amount;
        totalSupply -= amount;
    }
}`,
  },
  {
    label: "Simple Safe Contract",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SecureVault is Ownable, ReentrancyGuard {
    mapping(address => uint256) private balances;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    function deposit() external payable {
        require(msg.value > 0, "Must deposit > 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Effects before interactions
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}`,
  },
];
