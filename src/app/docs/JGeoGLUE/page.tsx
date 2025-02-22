export default function Page() {
  return (
    <>
      <title>
        JGeoGLUE: A GeoGraphic Language Understanding Evaluation Benchmark for
        Japanese | TRIDENT
      </title>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css"
      ></link>
      <link
        rel="stylesheet"
        href="https://bulma.io/vendor/fontawesome-free-5.15.2-web/css/all.min.css"
      />
      <div
        style={{
          backgroundColor: "white",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            width: "80vw",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              color: "black",
              fontWeight: "bold",
              fontSize: "2.5rem",
              textAlign: "center",
              paddingTop: "60px",
              width: "50vw",
            }}
          >
            JGeoGLUE: A GeoGraphic Language Understanding Evaluation Benchmark
            for Japanese
          </h1>
          <h2
            style={{
              color: "black",
              textAlign: "center",
              paddingTop: "20px",
              width: "50vw",
              fontWeight: "normal",
            }}
          >
            <a
              href="https://github.com/yuiseki"
              style={{
                fontSize: "1.5rem",
              }}
            >
              Yui Matsumura
            </a>
            <sup>1</sup>
          </h2>
          <h2
            style={{
              color: "black",
              textAlign: "center",
              paddingTop: "10px",
              width: "50vw",
              fontWeight: "normal",
              fontSize: "1.5rem",
            }}
          >
            <sup>1</sup>
            Humanity, UN Open GIS Initiative, Helpfeel, Inc.
          </h2>
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "5px",
            }}
          >
            <span className="link-block">
              <a
                href="https://github.com/yuiseki/TRIDENT"
                className="external-link button is-normal is-rounded is-dark"
              >
                <span
                  className="icon"
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                >
                  <svg
                    className="svg-inline--fa fa-github fa-w-16"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="github"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 496 512"
                    data-fa-i2svg=""
                  >
                    <path
                      fill="currentColor"
                      d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
                    ></path>
                  </svg>
                </span>
                <span>Github Code</span>
              </a>
            </span>
            <span className="link-block">
              <a
                href="https://trident.yuiseki.net/q"
                className="external-link button is-normal is-rounded is-dark"
              >
                <span className="icon">
                  <svg
                    className="svg-inline--fa fa-globe fa-w-16"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="globe"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 496 512"
                    data-fa-i2svg=""
                  >
                    <path
                      fill="currentColor"
                      d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z"
                    ></path>
                  </svg>
                </span>
                <span>Join Crowdsourcing</span>
              </a>
            </span>
            <span
              className="link-block"
              style={{
                opacity: 0.6,
              }}
            >
              <a
                href="#"
                className="external-link button is-normal is-rounded is-dark"
              >
                <span
                  className="icon"
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                >
                  <svg
                    className="svg-inline--fa fa-database fa-w-14"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="database"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    data-fa-i2svg=""
                  >
                    <path
                      fill="currentColor"
                      d="M448 73.143v45.714C448 159.143 347.667 192 224 192S0 159.143 0 118.857V73.143C0 32.857 100.333 0 224 0s224 32.857 224 73.143zM448 176v102.857C448 319.143 347.667 352 224 352S0 319.143 0 278.857V176c48.125 33.143 136.208 48.572 224 48.572S399.874 209.143 448 176zm0 160v102.857C448 479.143 347.667 512 224 512S0 479.143 0 438.857V336c48.125 33.143 136.208 48.572 224 48.572S399.874 369.143 448 336z"
                    ></path>
                  </svg>
                </span>
                <span>HF Dataset (Coming soon)</span>
              </a>
            </span>
          </div>
        </div>
        <section className="section" id="abstract">
          <div className="container is-max-desktop">
            <div className="columns is-centered has-text-centered">
              <div className="column is-four-fifths">
                <h2 className="title is-3">Abstract</h2>
                <div className="content has-text-justified">
                  <p>
                    本研究では、従来中国語を対象に発展してきた地理空間自然言語処理の評価枠組み「GeoGLUE」を参考とし、
                    日本語固有の地理空間言語表現の課題に対応する新たなベンチマーク「JGeoGLUE」を提案する。
                    これまで、日本語における地理空間に関するタスク定義、データセット、統一された評価指標は存在せず、
                    実務上のニーズと学術的要求を満たすための評価基盤が求められていた。
                    JGeoGLUEは、GeoGLUEの枠組みを踏襲しながらも、固定選択肢形式を採用してクラウドソーシングによるアノテーションの一貫性を確保することにより、
                    地名の整合性（GeoEAG）、地名要素のタグ付け（GeoETA）、検索クエリの意図分類（GeoQIC）、空間表現の分類（GeoSEC）、そして2つの地名間の関係性評価（GeoRCC）
                    といった複数のタスクを統合している。
                    これらのタスクは、地理空間情報の記述における微妙なニュアンスや一般常識、さらには利用者が実際に検索や意思決定で参照する情報の質を定量的に評価するためのものであり、
                    今後の日本語地理空間NLPモデルの性能向上や実用化に大きく寄与すると期待される。
                    本研究は、先行するGeoGLUEの成果を堅実な基盤として、日本語という言語特性に根ざした新たな課題設定を提案することで、
                    学術的および実務的な側面から地理情報処理の新たな地平を切り拓く試みである。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section" id="overview">
          <div className="container is-max-desktop content">
            <h2 className="title">JGeoGLUE Overview</h2>
            <div className="content has-text-justified">
              <h3 className="title is-5">
                GeoEAG: Geographic Entity AliGnment
              </h3>
              <p>
                GeoEAGは、文章中に登場する2つの地名が同一の実体を指しているかどうかを評価するタスクである。
                日本語では、正式名称と略称、異なる表記が頻繁に見られるため、
                例えば「ユニバーサル・スタジオ・ジャパン」と「USJ」や「関空」と「関西国際空港」といったケースにおいて、
                表記の違いによる混同を避けることが重要である。
                本タスクでは、回答者はあらかじめ固定された選択肢「全く同じ」、「部分的に一致」、「全く違う」から適切な回答を選ぶ。
                このタスクの設問は、回答者が各地名の意味やその略称の背景を一般常識として把握していることを前提とし、
                直接的な回答が文章中に示されないように工夫されている。
                GeoEAGは、モデルが地名の表記揺れや省略に対して柔軟かつ正確に対応できるかを評価する上で、基礎的かつ実用的な役割を果たす。
              </p>
              <h3 className="title is-5">
                GeoETA: Geographic Elements TAgging
              </h3>
              <p>
                GeoETAは、与えられた住所表現や地名の記述に対して、各要素を正確に分類するタスクである。
                日本語の住所表記は、都道府県、市区町村、町名、番地、施設名など複数のレベルから構成され、
                また省略や略記が多く見られるため、正確なタグ付けが必要不可欠である。
                本タスクでは、回答者は「都道府県」、「市区町村」、「町名」、「番地」、「施設名」、「その他」といった固定選択肢から、
                各部分がどのカテゴリに属するかを選択する。
                たとえば、「東京都港区芝公園4-2-8
                東京タワー」という住所表記において、「芝公園」は「町名」、「東京タワー」は「施設名」として分類される。
                本タスクは、住所情報の精度向上やジオコーディングの前処理としての有用性から、実務において高い価値を持つと同時に、日本語特有の表記上の課題に対応するための重要な基盤となる。
              </p>
              <h3 className="title is-5">
                GeoQIC: Geospatial Query Intent Classification
              </h3>
              <p>
                GeoQICは、地理空間に関する検索クエリの意図を評価するタスクである。
                現代の検索システムでは、ユーザーは単なる地名の検索だけでなく、具体的な経路情報や施設の詳細、さらには口コミや評価情報を求めるクエリを入力することが増えている。
                本タスクでは、回答者はあらかじめ固定された選択肢「地名検索」、「経路検索」、「施設情報検索」、「レビュー検索」、「その他」の中から、
                与えられた検索クエリがどの意図に沿っているかを選ぶ。
                例えば、「新宿駅から渋谷駅までの最短ルートを教えて」というクエリは、「経路検索」として分類され、
                「大阪城の入場料は？」というクエリは「施設情報検索」に該当する。
                GeoQICは、実際の検索意図を正確に評価することにより、地理情報サービスのユーザビリティ向上に寄与する。
                また、固定選択肢形式により回答のばらつきを抑え、クラウドソーシングによる大規模なデータセット構築が容易になる点が大きな強みである。
              </p>
              <h3 className="title is-5">
                GeoSEC: Geospatial Spatial Expression Classification
              </h3>
              <p>
                GeoSECは、文章内に含まれる空間表現を評価するタスクであり、具体的には、方向性、距離・位置、領域、面積といった空間情報を固定選択肢から分類する。
                日本語の地理記述では、「北側」、「徒歩10分」、「周辺」、「広い」といった表現が頻出するが、これらの表現は、文脈や記述方法によって意味が微妙に異なる場合がある。
                本タスクでは、回答者は「方向表現」、「距離・位置表現」、「領域表現」、「面積表現」、「その他」といった選択肢から、与えられた表現がどのカテゴリーに属するかを選ぶ。
                たとえば、「渋谷駅の北側」という表現は「方向表現」、
                「徒歩10分以内」という表現は「距離・位置表現」、
                「渋谷駅周辺」という表現は「領域表現」、
                「台東区は港区より広い」という比較表現は「面積表現」として分類される。
                GeoSECは、地理的文脈を定量的に捉えるためのデータとして、
                地図情報システムやナビゲーション、地域ブランディングなどへの応用に貢献することが期待される。
              </p>
              <h3 className="title is-5">
                GeoRCC: Geospatial Relation Classification
              </h3>
              <p>
                GeoRCCは、文章内に登場する2つの地理的エンティティ間の関係性を評価するタスクである。
                回答者は、固定選択肢「隣接」、「近接」、「包含」、「遠隔」、「その他」から、
                与えられた2つの地名がどのような空間的関係にあるかを選ぶ。
                本タスクの設問は、回答者が一般常識や地理的背景知識を踏まえて判断できるよう工夫されており、
                設問文中に直接回答が記載されないよう注意が払われている。
                例えば、「札幌駅」と「大通公園」の関係は、駅と公園が市内中心部に位置しており比較的近いことから「近接」と評価される。
                一方、「大阪市」と「USJ」の場合、大阪市の一部として位置づけられるため「包含」と分類され、
                また「東京タワー」と「東京スカイツリー」は、物理的に大きく離れているため「遠隔」と判断される。
                GeoRCCは、地理的な関係性に関する常識をモデルがどれだけ正確に学習できるかを評価する上で、非常に有用なタスクとなる。
              </p>
              <p>
                以上の各タスクは、いずれも固定選択肢形式を採用することで、クラウドソーシングによるアノテーションの一貫性と効率性を確保している。
                JGeoGLUEは、これらのタスクを統合することにより、日本語における地理空間情報の記述や常識を定量的に評価できる新たな評価基盤として、
                今後の地理空間NLPモデルの性能向上や実用化に大きく寄与することが期待される。
              </p>
            </div>
          </div>
        </section>
        <section className="section" id="BibTeX">
          <div className="container is-max-desktop content">
            <h2 className="title">BibTeX</h2>
            <pre>
              <code>There is no such thing</code>
            </pre>
          </div>
        </section>
      </div>
    </>
  );
}
