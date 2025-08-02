"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { client } from "../libs/client";
import styles from "./page.module.css";

type Tweet = {
  id: string;
  text: string;
  image?: {
    url: string;
  };
};

type ApiResponse = {
  contents: Tweet[];
};

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
    }, 1200);
  };

  return (
    <main className={styles.mahjongTable}>
      <h1 className={styles.title}>麻雀たのしいガチャ</h1>

      {phase === 'animating' && (
        <Image
          src="/hand.png"
          alt="ツモる手"
          width={150}
          height={150}
          className={`${styles.hand} ${styles.handAnimating}`}
          priority
        />
      )}
      
      <div className={styles.displayArea}>
        {/* initial または animating フェーズでは、裏向きの牌を表示 */}
        <div className={`${styles.initialTile} ${phase === 'showingTweet' ? styles.hidden : styles.visible}`} />
        
        {/* ★★★ ここを修正 ★★★ */}
        {/* showingTweet フェーズでのみ、ツイート表示エリアの要素全体を描画する */}
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