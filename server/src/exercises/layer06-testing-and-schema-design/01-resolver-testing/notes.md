# 演習6-1: Resolverテスト — 学び・気づきのログ

（実装・動作確認の結果をここに記録してください）

各specファイルの実行時間（Time: セクション）
books-resolver.spec.ts 0.704 s
books-integration.spec.ts  0.822 s
error-handling.spec.ts 0.839 s

ユニット vs 統合の速度差（具体的な数字で）
上記の通り、ユニットテストの方が実行時間は短くなっていますが、今回小規模でかつインメモリになるものなので、実際にデータベースと接続したりといったオーバーヘッドがないため、そこまで速度差は出なかったんですけども、\n\n統合テストの方が実行時間が長いということが判明しました。

Books-resolverとerror-handling.resolverのカバレッジはいずれも100%でした。


