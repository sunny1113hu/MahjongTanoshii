"use client";

import { useState, useEffect } from "react";
import { client } from "../libs/client";
import styles from "./page.module.css";

// 型定義は変更なし
type Tweet = { id: string; text: string; image?: { url: string }; };
type ApiResponse = { contents: Tweet[]; };

type Phase = 'initial' | 'animating' | 'showingTweet';

export default function Home() {
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);
  const [currentTweet, setCurrentTweet] = useState<Tweet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('initial');

  useEffect(() => {
    client.get<ApiResponse>({ endpoint: "tweets" })
      .then((data) => {
        setAllTweets(data.contents);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const drawTweet = () => {
    if (phase === 'animating' || allTweets.length === 0) return;

    setPhase('animating');
    
    const randomIndex = Math.floor(Math.random() * allTweets.length);
    const newTweet = allTweets[randomIndex];

    setTimeout(() => {
      setCurrentTweet(newTweet);
      setPhase('showingTweet');
    }, 1200); // アニメーション時間
  };

  return (
    <main className={styles.mahjongTable}>
      <h1 className={styles.title}>麻雀たのしいガチャ</h1>

      <div className={styles.displayArea}>
        {/* initial または animating フェーズでは、裏向きの牌を表示 */}
        {/* ★ keyを追加してアニメーションを毎回リセット */}
        {phase !== 'showingTweet' && !isLoading && (
          <div 
            key={Date.now()} 
            className={`${styles.initialTile} ${phase === 'animating' ? styles.tileAnimating : ''}`} 
          />
        )}
        
        {/* showingTweet フェーズでのみ、ツイートを表示 */}
        {phase === 'showingTweet' && currentTweet && (
          <div className={`${styles.tweetDisplay} ${styles.visible}`}>
            <p className={styles.tweetText}>{currentTweet.text}</p>
            {currentTweet.image && (
              <img
                src={currentTweet.image.url}
                alt="ツイート画像"
                className={styles.tweetImage}
              />
            )}
          </div>
        )}
      </div>

      <button onClick={drawTweet} className={styles.tsumoButton} disabled={phase === 'animating' || isLoading}>
        {isLoading ? "準備中..." : (phase === 'animating' ? "ツモり中..." : "ツモる")}
      </button>
    </main>
  );
}