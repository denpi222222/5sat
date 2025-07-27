'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wallet, 
  AlertTriangle, 
  Coins, 
  BookOpen, 
  Info, 
  TrendingUp, 
  Shield 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Constants for Camelot
const CRAA_ADDRESS = process.env.NEXT_PUBLIC_CRAA_ADDRESS || '0xBb526D657Cc1Ba772469A6EC96AcB2ed9D2A93e5';
const CAMELOT_LINK = `https://app.camelot.exchange/?token2=${CRAA_ADDRESS}&swap=v2`;
const DEXSCREENER_LINK = process.env.NEXT_PUBLIC_DEXSCREENER_LINK || 'https://dexscreener.com/apechain/0x7493b5d547c6d9f42ca1133dcd39e2472b633efc';

export function WalletConnectNoSSR() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { t } = useTranslation();
  
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const isApeChain = chainId === 33139;

  const { data: craBal } = useBalance({
    address,
    token: CRAA_ADDRESS as `0x${string}`,
    query: { enabled: !!address },
  });

  // Blinking effect
  useEffect(() => {
    if (isSwapOpen) {
      const interval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isSwapOpen]);

  const handleBuyClick = async () => {
    if (!window.ethereum) {
      window.open(CAMELOT_LINK, '_blank');
      return;
    }

    try {
      // Switch to ApeChain (33139 = 0x8173)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x8173' }],
      });
    } catch (e: any) {
      if (e.code === 4902) {
        // Add ApeChain if not exists
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x8173',
            chainName: 'ApeChain',
            nativeCurrency: { name: 'APE', symbol: 'APE', decimals: 18 },
            rpcUrls: [process.env.NEXT_PUBLIC_APECHAIN_RPC || 'https://apechain.calderachain.xyz/http'],
            blockExplorerUrls: [process.env.NEXT_PUBLIC_APECHAIN_EXPLORER || 'https://apescan.io/'],
          }],
        });
      } else {
        console.error('Switch error:', e);
      }
    }

    window.open(CAMELOT_LINK, '_blank');
  };

  // Format CRA balance nicely
  const formatCRABalance = (balance: string) => {
    const num = parseFloat(balance);
    if (!isFinite(num) || num < 0) {
      return '0';
    }
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
      num
    );
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className='flex items-center'>
      {!isConnected ? (
        <Button
          onClick={() => open()}
          className='bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0'
        >
          <Wallet className='w-4 h-4 mr-2' />
          {t('wallet.connect', 'Connect Wallet')}
        </Button>
      ) : !isApeChain ? (
        <Button
          onClick={() => open({ view: 'Networks' })}
          className='bg-red-600 hover:bg-red-700 text-white border-0'
        >
          <AlertTriangle className='w-4 h-4 mr-2' />
          {t('network.switch', 'Switch to ApeChain')}
        </Button>
      ) : (
        <div className='flex flex-col items-end gap-2'>
          <Button
            onClick={() => open()}
            className='bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 min-w-[180px] px-4 py-2 text-sm font-medium'
          >
            <Wallet className='w-4 h-4 mr-2' />
            {address
              ? formatAddress(address)
              : t('wallet.connected', 'Connected')}
          </Button>

          {/* CRA Balance Display */}
          {craBal && (
            <div className='flex flex-col items-end gap-1'>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-400/40 rounded-lg backdrop-blur-sm shadow-lg'>
                <div className='flex items-center gap-1'>
                  <Coins className='w-4 h-4 text-cyan-400' />
                  <span className='text-xs font-medium text-cyan-300'>
                    Balance:
                  </span>
                </div>
                <span className='text-sm font-bold text-cyan-100 font-mono'>
                  {formatCRABalance(craBal.formatted)} CRAA
                </span>
              </div>

              {/* Blinking buy CRAA button */}
              <motion.div
                animate={{
                  boxShadow: isBlinking
                    ? '0 0 15px rgba(255, 183, 0, 0.6)'
                    : '0 0 0px rgba(255, 183, 0, 0)'
                }}
                transition={{ duration: 0.5 }}
                className="rounded-lg overflow-hidden"
              >
                <Button
                  onClick={() => setIsSwapOpen(true)}
                  className='w-full min-w-[180px] text-sm px-3 py-1.5 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:brightness-110 font-bold'
                >
                  🟡 Buy CRAA
                </Button>
              </motion.div>

              {/* Game Guide Button */}
              <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant='outline'
                    size='default'
                    className='w-full min-w-[180px] text-sm px-3 py-1.5 h-8 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  >
                    <BookOpen className='w-4 h-4 mr-2' />
                    {t('wallet.instruction', 'Instruction')}
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl max-h-[80vh] bg-slate-900 border-slate-700'>
                  <DialogHeader>
                    <DialogTitle className='text-xl font-bold text-white flex items-center'>
                      <BookOpen className='w-5 h-5 mr-2 text-cyan-400' />
                      {t('wallet.gameGuide', 'CrazyCube Game Guide')}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className='h-[60vh] pr-4'>
                    <div className='text-slate-300 whitespace-pre-line text-sm leading-relaxed'>
                      {t(
                        'wallet.gameGuideContent',
                        'Game guide content not available'
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* CRAA Buy Modal */}
          <Dialog open={isSwapOpen} onOpenChange={setIsSwapOpen}>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] rounded-2xl bg-[#0b0e13] border border-white/10 shadow-[0_0_50px_rgba(255,183,0,.12)] overflow-y-auto">
              <DialogHeader className="p-0 sticky top-0 bg-[#0b0e13] z-10">
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    Buy CRAA on Camelot
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </DialogHeader>

              {/* Main content */}
              <div className="px-5 py-4 space-y-4">
                {/* Instructions */}
                <div className="bg-blue-500/15 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-300 text-sm space-y-2">
                      <div className="font-semibold">Instruction for buying CRAA:</div>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Click the "🟡 Buy CRAA on Camelot" button below</li>
                        <li>Automatically switch to the ApeChain network</li>
                        <li>Set slippage: buy 3-5%, sell 10-15%</li>
                        <li>Confirm the transaction in your wallet</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Detailed fees and slippage description */}
                <div className="bg-amber-500/15 border border-amber-500/30 rounded-lg p-4">
                  <div className="text-amber-300 text-sm space-y-3">
                    <div className="font-semibold text-base">💰 Fees and Slippage:</div>
                    
                    <div className="space-y-2">
                      <div className="font-medium">🟢 Buy CRAA (APE → CRAA):</div>
                      <div className="text-xs space-y-1 ml-4">
                        <div>• <span className="text-green-300">Camelot Fee:</span> 0% (free)</div>
                        <div>• <span className="text-green-300">Slippage:</span> 3-5% (recommended)</div>
                        <div>• <span className="text-green-300">Token Tax:</span> 0% on purchase</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-medium">🔴 Sell CRAA (CRAA → APE):</div>
                      <div className="text-xs space-y-1 ml-4">
                        <div>• <span className="text-red-300">Camelot Fee:</span> 0% (free)</div>
                        <div>• <span className="text-red-300">Slippage:</span> 10-15% (recommended)</div>
                        <div>• <span className="text-red-300">Token Tax:</span> 10% (automatically)</div>
                        <div className="text-amber-200 font-medium">⚠️ Total on sale: 10-15% slippage + 10% tax</div>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 mt-3">
                      <div className="font-medium text-amber-200">💡 What is slippage?</div>
                      <div className="text-xs text-amber-100 mt-1">
                        Slippage is the maximum price change you are willing to accept. 
                        With high volatility or low liquidity, the price can change between 
                        the moment you send the transaction and its execution.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screenshot */}
                <div className="bg-purple-500/15 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-purple-300 text-sm font-medium mb-3">📸 Example of Camelot settings:</div>
                    <div className="relative">
                      <img 
                        src="/images/1234.jpg" 
                        alt="Camelot settings example" 
                        className="w-full h-auto max-h-[400px] object-contain rounded-lg border border-purple-400/30 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                      <div className="hidden text-purple-200 text-xs p-4 bg-purple-500/20 rounded-lg">
                        Screenshot of Camelot settings will be added to the /public/images/1234.jpg folder
                      </div>
                    </div>
                  </div>
                </div>

                {/* DexScreener button */}
                <Button 
                  onClick={() => window.open(DEXSCREENER_LINK, '_blank')}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:brightness-110 font-bold flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  📊 View CRAA price on DexScreener
                </Button>

                {/* Blinking button */}
                <motion.div
                  animate={{ 
                    boxShadow: isBlinking 
                      ? '0 0 20px rgba(255, 183, 0, 0.6)' 
                      : '0 0 0px rgba(255, 183, 0, 0)' 
                  }}
                  transition={{ duration: 0.5 }}
                  className="rounded-xl overflow-hidden"
                >
                  <Button 
                    onClick={handleBuyClick}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:brightness-110 transition-all duration-300"
                  >
                    🟡 Buy CRAA on Camelot
                  </Button>
                </motion.div>

                {/* Explanation */}
                <div className="text-center text-xs text-gray-400 space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span>Safe purchase via Camelot V2</span>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Recommended settings: buy 3-5% slippage, sell 10-15% slippage
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
