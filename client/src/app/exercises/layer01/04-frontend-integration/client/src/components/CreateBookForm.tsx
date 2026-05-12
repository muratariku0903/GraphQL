"use client";

import { gql } from "urql";
import { useCreateBookMutation } from "@/generated/graphql";

gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
      title
      genre
      author {
        name
      }
    }
  }
`;

export const CreateBookForm = () => {
  const [{ fetching }, executeMutation] = useCreateBookMutation();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { data, error } = await executeMutation({
      input: {
        title: String(formData.get("title")),
        authorId: "a1",
        publishedYear: formData.get("publishedYear")
          ? Number(formData.get("publishedYear"))
          : null,
        genre: "FICTION",
      },
    });

    if (error) {
      console.error("Mutation failed:", error);
    } else {
      console.log("Created:", data?.createBook);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="title" />
      <input
        type="text"
        name="publishedYear"
        defaultValue={2026}
        placeholder="publishedYear"
      />
      <button type="submit">{fetching ? "登録中..." : "登録"}</button>
    </form>
  );
};
