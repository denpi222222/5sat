// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract WebModel3Reader {
    string public webModel3Id;
    
    constructor(string memory _webModel3Id) {
        webModel3Id = _webModel3Id;
    }
    
    function getWebModel3Id() public view returns (string memory) {
        return webModel3Id;
    }
    
    function updateWebModel3Id(string memory _newId) public {
        webModel3Id = _newId;
    }
}
