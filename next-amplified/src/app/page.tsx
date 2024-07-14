import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { cookies } from 'next/headers';

import { revalidatePath } from 'next/cache';
import * as mutations from '@/graphql/mutations';
import * as queries from '@/graphql/queries';
import config from '@/amplifyconfiguration.json';
import { create } from 'domain';

const cookiesClient = generateServerClientUsingCookies({
  config,
  cookies
});


// 2. Create a new Server Action
async function createTodo(formData: FormData) {
  'use server';
  const { data } = await cookiesClient.graphql({
    query: mutations.createTodo,
    variables: {
      input: {
        name: formData.get('name')?.toString() ?? ''
      }
    }
  });

  console.log('Created Todo: ', data?.createTodo);

  revalidatePath('/');
}

export default async function Home() {
  // 2. Fetch additional todos
  const { data, errors } = await cookiesClient.graphql({
    query: queries.listTodos
  });

  const todos = data.listTodos.items;

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        marginTop: '100px'
      }}
    >
      <form
        action={createTodo}
        style={{ padding: '15px', marginBottom:"10px", border: "solid 1px #fff", borderRadius: "10px", display: "flex", flexDirection: "column" }}>
        <h3
          style={{ marginBottom: "5px" }}>Add Todo</h3>
        <input
          name="name"
          placeholder="Add a todo"
          style={{ padding: "5px", borderRadius: "5px", marginBottom: "10px" }} />
        <button
          type="submit"
          style={{ padding: "5px 0px", borderRadius: "5px", cursor: "pointer" }}>Add</button>
      </form>

      {/* 3. Handle edge cases & zero state & error states*/}
      {(!todos || todos.length === 0 || errors) && (
        <div>
          <p>No todos, please add one.</p>
        </div>
      )}

      {/* 4. Display todos*/}
      <ul>
        {todos.map((todo) => {
          return <li style={{ listStyle: 'none' }}>{todo.name}</li>;
        })}
      </ul>

    </div>
  );
}