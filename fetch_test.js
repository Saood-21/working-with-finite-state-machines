
import fetch from 'node-fetch';
import { createMachine, assign, interpret } from 'xstate';

// fetch('http://localhost:3000/posts?title=eeeeeee').then(response => console.log(response))
const userFetch = (url) => {
     return fetch(url).then((response) => response.json())
    };

console.log(userFetch);
    

// const userFetch = (url) =>
//   fetch(url).then((response) => response.json());

const machine = createMachine({
    initial : 'idle',
    context : {
        url : "http://localhost:3000/posts?title=eeeeeee"
    },
    states : {
        idle : {
            on : {
                FETCH : {
                    target : 'loading',
                    //actions : (context, event) => {console.log("messade received")}
                }
            }
        },
        loading : {
            invoke : {
                id: 'getUser',
                src : (context, event) => userFetch(context.url),
                onDone: {
                    target: 'success',
                    actions : [(context, event) => {
                        console.log(event.data, "wwww")
                    }]
                },
                onError: {
                    actions : (context, event) => {console.log("error", event.data)}
                }
            } 
        },
        success: {}
    }
})

const iMachine = interpret(machine).onTransition((state) => {console.log(state.value)}).start()

iMachine.send("FETCH")