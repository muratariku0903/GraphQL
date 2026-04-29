# 演習4-1: エラーハンドリング — 学び・気づきのログ

（実装・動作確認の結果をここに記録してください）

query {
  bookOrThrow(id: "1") {
    title
    genre
  }
}

条件をクリエイトし、問題なく実行に成功し、値が返ってきた。


query {
  bookOrThrow(id: "999") {
    title
  }
}

上記のフェリアはnot found errorとなり、あらかじめ定義しておいたnot found exceptionがフィルターフォーマットによって加工されてエラーになっていることを確認できました。特にerrorsの中のextensionsの中のコードの部分がnot foundになっていました。


query {
  bookResult(id: "1") {
    __typename
    ... on Book {
      title
      genre
    }
    ... on BookNotFoundError {
      message
      bookId
    }
  }
}


上記のクエリを実行した結果、存在するブックに関しては、ブックオブジェクトのタイトルとジャンルが返ってきました。
存在しない場合は、BookResultで定義したBookNotFoundErrorが返ってきており、メッセージとブックIDが確認できます。

query {
  booksByIds(ids: ["1", "999", "2"]) {
    __typename
    ... on Book {
      id
      title
    }
    ... on BookNotFoundError {
      message
      bookId
    }
  }
}
上記のプレイを実行した場合、ID 1と2に関してはBookが返ってきており、999に関してはBookNotFoundErrorが返ってきました。


query {
  bookOrThrow(id: "not-exist") {
    title
  }
}
こちら開発モードだったので、スタックトレースはエラーに含まれています。

