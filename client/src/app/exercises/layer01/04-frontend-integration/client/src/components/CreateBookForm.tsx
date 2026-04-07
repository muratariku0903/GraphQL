"use client";

import { gql, useMutation } from "urql";
import { Genre } from "./BookList";

const CreateBookMutation = gql`
  mutation createBook($input: CreateBookInput!) {
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
  const [{ fetching }, executeMutation] = useMutation(CreateBookMutation);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { data, error } = await executeMutation({
      input: {
        title: formData.get("title"),
        authorId: "a1",
        publishedYear: formData.get("publishedYear")
          ? Number(formData.get("publishedYear"))
          : null,
        genre: Genre.FICTION,
      },
    });

    if (error) {
      console.error("Mutation failed:", error);
    } else {
      console.log("Created:", data?.createPost);
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
