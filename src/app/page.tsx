"use client";

import { useState, useEffect } from "react";
import { client } from "../libs/client";
import styles from "./page.module.css";

type Tweet = {
  id: string;
  text: string;
  image?: { url: string };
  images?: { url: string }[];
};

type ApiResponse = {
  contents: Tweet[];
  totalCount: number; // totalCountを追加
};

type Phase = 'initial' | 'animating' | 'showingTweet';

export default function Home() {
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);
  const [currentTweet, setCurrentTweet] = useState<Tweet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('initial');

  useEffect(() => {
    const fetchAllTweets = async () => {
      try {
        // まずは件数だけを取得
        const res = await client.get<ApiResponse>({
          endpoint: "tweets",
          queries: { fields: 'id', limit: 0 } // fields指定で軽量化
        });
        const totalCount = res.totalCount;
        const limit = 100; // 1回あたりの取得件数（最大値）

        // 必要なリクエスト回数分の配列を作成
        const numRequests = Math.ceil(totalCount / limit);
        const requests = [...Array(numRequests)].map((_, i) => {
          return client.get<ApiResponse>({
            endpoint: "tweets",
            queries: { offset: i * limit, limit: limit }
          });
        });

        // 全てのリクエストを並行して実行
        const responses = await Promise.all(requests);

        // 全てのレスポンスからツイート本体だけを取り出して一つの配列にまとめる
        const allContents = responses.flatMap(res => res.contents);
        setAllTweets(allContents);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTweets();
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

      <div className={styles.displayArea}>
        {phase !== 'showingTweet' && !isLoading && (
          <div
            key={Date.now()}
            className={`${styles.initialTile} ${phase === 'animating' ? styles.tileAnimating : ''}`}
          />
        )}

        {phase === 'showingTweet' && currentTweet && (
          <div className={`${styles.tweetDisplay} ${styles.visible}`}>
            {/* ★ このdivを一つ追加する */}
            <div className={styles.tweetContent}>
              <p className={styles.tweetText}>{currentTweet.text}</p>

              {currentTweet.images && currentTweet.images.length > 0 ? (
                currentTweet.images.map((img) => (
                  <img
                    key={img.url}
                    src={img.url}
                    alt="ツイート画像"
                    className={styles.tweetImage}
                  />
                ))
              ) :
                currentTweet.image ? (
                  <img
                    src={currentTweet.image.url}
                    alt="ツイート画像"
                    className={styles.tweetImage}
                  />
                ) : null}
            </div>
          </div>
        )}
      </div>

      <button onClick={drawTweet} className={styles.tsumoButton} disabled={phase === 'animating' || isLoading}>
        {isLoading ? (
          <>
            <span className={styles.loader}></span>準備中...
          </>
        ) : (phase === 'animating' ? "ツモり中..." : "ツモる")}
      </button>
    </main>
  );
}