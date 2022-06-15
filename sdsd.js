import fetch from 'node-fetch';
import { createMachine, assign, interpret } from 'xstate';
const fetchUser = () =>
  fetch("http://localhost:3000/posts?title=eeeeeee").then((response) => response.json());

const userMachine = createMachine({
  id: 'user',
  initial: 'idle',
  context: {
    userId: "http://localhost:3000/posts?title=eeeeeee",
    user: undefined,
    error: undefined
  },
  states: {
    idle: {
      on: {
        FETCH: { target: 'loading' }
      }
    },
    loading: {
      invoke: {
        id: 'getUser',
        src: (context, event) => fetchUser(),
        onDone: {
          target: 'success',
          actions: assign({ 
              user: (context, event) => { 
                  console.log(event.data)
                  return event.data;
              } 
            }
          )
        },
        onError: {
          target: 'failure',
          actions: assign({ error: (context, event) => {
              console.log("test")
              event.data }})
        }
      }
    },
    success: {},
    failure: {
      on: {
        RETRY: { target: 'loading' }
      }
    }
  }
});

const iMachine = interpret(userMachine).onTransition((state) => {console.log(state.value)}).start()

iMachine.send("FETCH")