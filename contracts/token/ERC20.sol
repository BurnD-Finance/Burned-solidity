// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./IERC20.sol";
import "../access/Ownable.sol";
import "../loterry/Lottery.sol";
import "../loterry/ILottery.sol";
import "../interfaces/IUniswapV2Router02.sol";
import "../interfaces/IUniswapV2Pair.sol";
import "../interfaces/IUniswapV2Factory.sol";
import "./IBurnD.sol";

/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin guidelines: functions revert instead
 * of returning `false` on failure. This behavior is nonetheless conventional
 * and does not conflict with the expectations of ERC20 applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Ownable, IERC20, IBurnD {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    mapping(address => bool) private _isExcluded;

    uint256 private _totalSupply;
    uint256 private _totalBurned = 0;
    uint256 private _totalAddedToLiquidity = 0;
    uint256 private _totalAddedToLottery = 0;
    uint256 private _totalAddedToCharity = 0;

    string private _name;
    string private _symbol;

    uint256 minimumForEligibility = 500 * 1E18;
    uint256 public minimumBeforeAddingLiquidity = 500 * 1E18;

    ILottery public lotteryContract;
    IUniswapV2Router02 public uniswapV2Router;
    IUniswapV2Pair public uniswapV2Pair;

    uint8 public burnFee = 3;
    uint8 public liquidityFee = 5;
    uint8 public lotteryFee = 1;
    uint8 public charityFee = 1;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All three of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        lotteryContract = new Lottery(address(this));
        uniswapV2Router = IUniswapV2Router02(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );
        // Create a uniswap pair for this new token
        uniswapV2Pair = IUniswapV2Pair(
            IUniswapV2Factory(uniswapV2Router.factory()).createPair(
                address(this),
                uniswapV2Router.WETH()
            )
        );

        _isExcluded[address(this)] = true;
        _isExcluded[address(lotteryContract)] = true;
        _isExcluded[address(uniswapV2Pair)] = true;
        _isExcluded[address(uniswapV2Router)] = true;
        _isExcluded[owner()] = true;
    }

    //to receive ETH from uniswapV2Router when swapping
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function setBurnFee(uint8 _burnFee) external onlyOwner {
        uint8 _oldBurnFee = burnFee;
        burnFee = _burnFee;
        emit UpdatedBurnFee(_oldBurnFee, _burnFee);
    }

    function setLotteryFee(uint8 _lotteryFee) external onlyOwner {
        uint8 _oldLotteryFee = lotteryFee;
        lotteryFee = _lotteryFee;
        emit UpdatedLotteryFee(_oldLotteryFee, _lotteryFee);
    }

    function setLiquidityFee(uint8 _liquidityFee) external onlyOwner {
        uint8 _oldLiquidityFee = liquidityFee;
        liquidityFee = _liquidityFee;
        emit UpdatedLiquidityFee(_oldLiquidityFee, _liquidityFee);
    }

    function setCharityFee(uint8 _charityFee) external onlyOwner {
        uint8 _oldCharityFee = charityFee;
        charityFee = _charityFee;
        emit UpdatedCharityFee(_oldCharityFee, _charityFee);
    }

    function LpTokenBalance() public view returns (uint256) {
        return uniswapV2Pair.balanceOf(address(this));
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5,05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless this function is
     * overloaded;
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * Requirements:
     *
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        _approve(sender, _msgSender(), currentAllowance - amount);

        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender] + addedValue
        );
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        _approve(_msgSender(), spender, currentAllowance - subtractedValue);

        return true;
    }

    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        uint256 senderBalance = _balances[sender];
        require(
            senderBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        _balances[sender] = senderBalance - amount;
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
        _payFees(sender, recipient, amount);
    }

    function _payFees(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        if (!_isExcluded[sender]) {
            _setLotteryEligibility(sender);
        }

        if (!_isExcluded[recipient]) {
            _payLotteryFees(recipient, amount);
            _payLiquidityFees(recipient, amount);
            _burn(recipient, _calculatePercentageOfAmount(burnFee, amount));
        }
        lotteryContract.lottery();
        swapAndBurnLP(sender, recipient);
    }

    function swapAndBurnLP(address sender, address recipient) public {
        uint256 contractBalance = _balances[address(this)];
        bool canSwap = (contractBalance >= minimumBeforeAddingLiquidity);

        if (canSwap && sender != address(uniswapV2Pair)) {
            //add liquidity
            _swapAndAddLiquidity(contractBalance);
            //burn lp tokens, hence locking the liquidity forever
            burnLpTokens();
        }
    }

    function _swapAndAddLiquidity(uint256 contractBalance) private {
        // split the contract balance into halves
        uint256 half = contractBalance / (2);
        uint256 otherHalf = contractBalance - (half);

        // capture the contract's current ETH balance.
        // this is so that we can capture exactly the amount of ETH that the
        // swap creates, and not make the liquidity event include any ETH that
        // has been manually sent to the contract
        uint256 initialEthBalance = address(this).balance;

        // swap tokens for ETH
        swapTokensForEth(half); // <- this breaks the ETH -> HATE swap when swap+liquify is triggered

        // how much ETH did we just swap into?
        uint256 newEthBalance = address(this).balance - (initialEthBalance);

        // add liquidity to uniswap
        addLiquidity(otherHalf, newEthBalance);
    }

    function swapTokensForEth(uint256 tokenAmount) private {
        // generate the uniswap pair path of token -> weth
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapV2Router.WETH();

        _approve(address(this), address(uniswapV2Router), tokenAmount);

        // make the swap
        uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            0, // accept any amount of ETH
            path,
            address(this),
            block.timestamp
        );
    }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private {
        // approve token transfer to cover all possible scenarios
        _approve(address(this), address(uniswapV2Router), tokenAmount);

        // add the liquidity
        uniswapV2Router.addLiquidityETH{value: ethAmount}(
            address(this),
            tokenAmount,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            address(this),
            block.timestamp
        );
    }

    function _payLotteryFees(address account, uint256 amount) internal {
        uint256 lotteryAmount =
            _calculatePercentageOfAmount(lotteryFee, amount);
        _balances[account] -= lotteryAmount;
        _setLotteryEligibility(account);
        _balances[address(lotteryContract)] += lotteryAmount;
        _totalAddedToLottery += lotteryAmount;
        emit Transfer(account, address(lotteryContract), lotteryAmount);
    }

    function _payLiquidityFees(address account, uint256 amount) internal {
        uint256 liquidityAmount =
            _calculatePercentageOfAmount(liquidityFee, amount);
        _balances[account] -= liquidityAmount;
        _balances[address(this)] += liquidityAmount;
        _totalAddedToLiquidity += liquidityAmount;
        emit Transfer(account, address(this), liquidityAmount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        _balances[account] = accountBalance - amount;
        _totalSupply -= amount;
        _totalBurned += amount;
        emit Transfer(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _calculatePercentageOfAmount(uint8 percent, uint256 amount)
        public
        pure
        returns (uint256)
    {
        return (amount * (percent)) / (10**2);
    }

    function _setLotteryEligibility(address account) internal {
        if (balanceOf(account) >= minimumForEligibility) {
            ILottery(lotteryContract).addToLottery(account);
        } else {
            ILottery(lotteryContract).removeFromLottery(account);
        }
    }

    function burnLpTokens() private {
        uint256 amount = uniswapV2Pair.balanceOf(address(this));
        uniswapV2Pair.transfer(address(0), amount);
        emit BurnedLPTokens(address(0), amount);
    }
}
