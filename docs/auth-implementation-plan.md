# NextAuth.js Role実装計画

## 現状の課題
- `src/app/q/page.tsx` で `session.user.role` にアクセスしようとすると型エラーが発生
- `prisma/schema.prisma` では User モデルに role フィールドが定義済み（@default("user")）
- `src/app/auth.ts` で NextAuth の設定を行っているが、role の型定義が不足

## 実装方針
NextAuth.js の TypeScript サポートを活用して、最小限の変更でセッションの型を拡張する

### 必要な変更点

1. `src/app/auth.ts` に以下の型定義を追加：
```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role: string
    } & DefaultSession["user"]
  }
}
```

2. NextAuth の設定に callbacks を追加：
```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Twitter],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        role: user.role,
      },
    }),
  },
});
```

## 期待される結果
- `session.user.role` へのアクセスが型安全に行えるようになる
- Prisma の User モデルで定義された role フィールドの値がセッションに正しく反映される
- デフォルトで "user" という値が設定される（Prisma スキーマの @default("user") による）

## 次のステップ
1. Code モードに切り替えて実装を行う
2. 実装後、型エラーが解消されることを確認
3. 必要に応じて、role の値に基づいた機能制限の実装を検討