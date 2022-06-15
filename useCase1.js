import { createMachine, assign, interpret, send, sendParent, spawn } from "xstate";
import fetch from 'node-fetch';

// const userFetch = (url) => {
//     console.log("fetch success")
//     return fetch(url).then((response) => response.json())
//    };

   const userFetch = (url) => {
       console.log(url)
       return fetch(url).then((response) => response.json())
   }

const mainMachine = createMachine({
    id : 'main',
    initial : 'idle',
    context : {
        data1 : undefined,//data received from actor 1
        data2 : undefined,//data received from actor 2
        account_no : 0, //argument sent to be used for fetching the data by the second actor
        ref1 : undefined,//reference of child 1
        ref2 : undefined//reference of child 2
    },
    states : {
        idle : {
            //spawn actor1 and actor2
            entry : 'spawn1',

            on : {
                INIT : {
                    target : 'waiting',
                    //send message to actor1 - which will fetch the initial data
                    actions : [send((context, event) => ({ ...context, type: 'INIT' }), {
                        to: (context) => context.ref1
                      })]
                }
            }
        },

        waiting : {
            on : {
                DATA1 : {
                    //receive data from child 1- store it in context
                    actions : ['addData1'],
                    //send context to Front End
                   
                },

                
                ADD : {
                    actions : [assign({account_no : (context, event) => event.value}),
                        send((context, event) => ({ ...context, type: 'INIT' }),
                     {
                        to: (context) => context.ref2
                      })],
                    target : 'waiting2'
                },
                
                EXIT : {
                    target : 'final'
                }

            }
        },
        waiting2 : {
            on : {
                DATA2 : {
                    //receive data from child - store it in context
                    actions : ['addData2', (context, event) => {console.log("data2 received", context.data2)}]
                    //send context to Front End
                },
                ADD : {
                    target : 'final'
                },
                EXIT : {
                    target : 'waiting'
                }
            }
        },

        final : {
            type : 'final'
        }

    }
},
{
    actions : {
        spawn1 : assign({
            ref2 : () => spawn(actor2),
            ref1 : () => spawn(actor1)
        }),

        addData1 : assign({
            data1 : (context, event) => event.data
        }),

        addData2 : assign({
            data2 : (context, event) => event.data
        })
    }
})

const actor1 = createMachine({
    id: 'child1',
    initial : 'idle',
    context : {
        data : undefined,//data fetched by this actor. Later sent to parent
        url : "http://localhost:3000/transactions"
    },
    states : {
        idle : {
            on : {
                INIT : {
                    //call the fetch command - store the data in the context
                    //send the context to the parent
                    target : "loading"
                }
            }
        },
        loading : {
            invoke : {
                src : (context, event) => userFetch(context.url),
                onDone : {
                    entry: (context, event) => {
                        console.log("entering on done");
                    },
                    target: 'success',
                    actions : [(context, event) => console.log("hyh"),assign({data : (context, event) => event.data}),
                        sendParent((context, event) => ({
                        ...context,
                        type: 'DATA1'
                      }))]        
                },
                onError : {
                    actions: (context, event) => console.log(error)
                }
            }
        },
        success : {
            entry: () => {
                console.log("in success state");
            }
        }
    }
})

const actor2 = createMachine({//separate state for invoking a promise
    id: 'child2',
    initial : 'idle',
    context : {
        data : undefined,
        account_no : 0
    },
    states : {
        idle : {
            actions : (context, event) => {console.log("idle state ",context)},
            on : {
                INIT : {
                    //call the fetch command - store the data in the context
                    //send the context to the parent
                    entry : [assign({account_no : (context, event) => event.account_no}),
                        (context, event) => {console.log("hehehe",context)}],
                    invoke : {
                        src : (context, event) => userFetch(`http://localhost:3000/depositer_info?account_no.=${context.account_no}`),
                        onDone : {
                            target : "success2",
                            actions : [assign({data : (context, event) => event.data}),
                                sendParent((context, event) => ({
                                ...context,
                                type: 'DATA2'
                              }))]                             
                        },
                        onError : {

                        }
                    }
                }
            }
        },
        success:{actions: ()=> {console.log("pls")}}
    }
})

const iMachine = interpret(mainMachine).onTransition((state) => {
    console.log(state.value, )
}).start()

iMachine.send({type: 'INIT'})
iMachine.send({type : 'ADD', value : 11111111})
// iMachine.send('EXIT')
// iMachine.send('ADD')
