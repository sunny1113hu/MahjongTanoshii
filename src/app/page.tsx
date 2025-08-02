"use client"; // ← これが重要！インタラクティブなページにするための宣言

import { useState, useEffect } from "react";
import { client } from "../libs/client";

// Tweetの型定義（前回と同じ）
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

export default function Home() {
  // すべてのツイートを保持する場所
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);
  // 現在表示しているツイートを保持する場所
  const [currentTweet, setCurrentTweet] = useState<Tweet | null>(null);
  // ローディング状態を管理する場所
  const [isLoading, setIsLoading] = useState(true);

  // 最初に1回だけmicroCMSから全データを取得する
  useEffect(() => {
    client.get<ApiResponse>({ endpoint: "tweets" })
      .then((data) => {
        setAllTweets(data.contents);
        // 最初のツイートをランダムに選んで表示
        if (data.contents.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.contents.length);
          setCurrentTweet(data.contents[randomIndex]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []); // 空の配列は「最初の一度だけ実行する」という意味

  // ガチャを引くための関数
  const drawTweet = () => {
    if (allTweets.length === 0) return; // ツイートがなければ何もしない
    const randomIndex = Math.floor(Math.random() * allTweets.length);
    setCurrentTweet(allTweets[randomIndex]);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
      <h1>ツイートガチャ</h1>
      
      {/* メインのガチャ表示エリア */}
      <div style={{ minHeight: '250px', border: '2px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLoading ? (
          <p>読み込み中...</p>
        ) : currentTweet ? (
          <div>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{currentTweet.text}</p>
            {currentTweet.image && (
              <img 
                src={currentTweet.image.url} 
                alt="ツイート画像" 
                style={{ maxWidth: '100%', height: 'auto', marginTop: '16px', borderRadius: '8px' }}
              />
            )}
          </div>
        ) : (
          <p>ツイートがありません。</p>
        )}
      </div>

      {/* ガチャを引くボタン */}
      <button 
        onClick={drawTweet}
        style={{
          padding: '15px 40px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: '#1DA1F2', // Twitter風のカラー
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer'
        }}
      >
        もう一回引く
      </button>
    </div>
  );
}