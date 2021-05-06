// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

interface IVault {

    function depositPrinciple( uint depositAmount_ ) external returns ( bool );

    function depositReserves( uint amount_ ) external returns ( bool );

}
