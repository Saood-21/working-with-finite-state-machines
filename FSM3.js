import { createMachine, assign, spawn, interpret, send, sendParent } from "xstate";

const actor2 = createMachine({
    id : 'child',
    initial : "state0",
    context : {
        age : 0,
        title : undefined,
        stuff : undefined
    },
    states : {
        state0 : {
            on : {
                NEXT : {
                    target : 'state1',
                    // actions : [(context, events) => {console.log("GGs")}, sendParent({type: 'LAST' })]
                    actions : [sendParent({type: 'LAST' }), (context, events) => {console.log("GGs")}]

                }
            }
        },
        state1 : {
            on : {
                NEXT : {
                    target : 'state2',
                    actions : sendParent({type: 'LAST' })
                }
            }
        },
        state2 : {}
    }
})

const actor1 = createMachine({
    id : 'parent',
    initial : "state0",
    context : {
        age : 0,
        title : undefined,
        stuff : undefined
    },
    states : {
        state0 : {
            on : {
                NEXT : {
                    actions : ['test'],
                    target : 'state1'
                }
            }
        },
        state1 : {
            on : {
                NEXT : {
                    target : 'state2',
                    actions : send({ type: 'NEXT' }, { to: (context) => context.title })
                }
            }
        },
        
        state2 : {
            on : {
            LAST : {
                actions : (context, events) => {console.log("done")}
            }
        },
        }
}},
    {
        actions : {
            test: assign({
                age: (context, event) => {
                    console.log("Eureka")
                    return context.age + 1;
                },
                title: () => spawn(actor2) 
            })
        }   
})

const iMachine = interpret(actor1).onTransition((state)=>{console.log(state.context.age)}).start()



iMachine.send('NEXT')
iMachine.send('NEXT')
