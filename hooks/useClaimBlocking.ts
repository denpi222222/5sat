import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

const CLAIM_BLOCK_KEY = 'crazycube:claimSectionBlocked';
const BLOCK_DURATION = 4 * 60 * 1000; // 4 minutes

export const useClaimBlocking = () => {
  const { address } = useAccount();
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Check if claim section is blocked
  const checkBlockStatus = () => {
    if (typeof window === 'undefined' || !address) return { isBlocked: false, timeLeft: 0 };
    
    try {
      const stored = localStorage.getItem(CLAIM_BLOCK_KEY);
      if (!stored) return { isBlocked: false, timeLeft: 0 };
      
      const blockData = JSON.parse(stored);
      const now = Date.now();
      const timeRemaining = blockData.blockedUntil - now;
      
      if (timeRemaining > 0) {
        console.log('🔒 Claim section is blocked, time remaining:', Math.ceil(timeRemaining / 1000));
        return { isBlocked: true, timeLeft: Math.ceil(timeRemaining / 1000) };
      } else {
        // Block expired, remove it
        localStorage.removeItem(CLAIM_BLOCK_KEY);
        return { isBlocked: false, timeLeft: 0 };
      }
    } catch (error) {
      console.error('Error checking claim block status:', error);
      return { isBlocked: false, timeLeft: 0 };
    }
  };

  // Block the claim section for 4 minutes
  const blockClaimSection = () => {
    if (typeof window === 'undefined' || !address) return;
    
    try {
      const blockData = {
        blockedAt: Date.now(),
        blockedUntil: Date.now() + BLOCK_DURATION,
        address: address
      };
      
      localStorage.setItem(CLAIM_BLOCK_KEY, JSON.stringify(blockData));
      setIsBlocked(true);
      setTimeLeft(240); // 4 minutes in seconds
      console.log('🔒 Claim section blocked for 4 minutes, localStorage set');
    } catch (error) {
      console.error('Error blocking claim section:', error);
    }
  };

  // Update block status and time remaining
  useEffect(() => {
    const updateStatus = () => {
      const status = checkBlockStatus();
      setIsBlocked(status.isBlocked);
      setTimeLeft(status.timeLeft);
    };

    // Check immediately
    updateStatus();

    // Update every second
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [address]);

  return {
    isBlocked,
    timeLeft,
    blockClaimSection,
    checkBlockStatus
  };
}; 