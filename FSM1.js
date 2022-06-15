import{createMachine, interpret} from 'xstate'

const light = createMachine({
    initial : 'unlit',
    context : {
        time : 0
    },
    states : {
        lit : {
            on:{TOGGLE : "unlit"},
        },
        unlit : {
            on:{
                TOGGLE :{ target:"lit", actions:['activate', 'sendTelemetry', 'notifyInactive']}
            }
        }
    }
    },
    {
    actions: {
        // action implementations
        activate: (context, event) => {
          console.log('activating...');
        },
        notifyActive: (context, event) => {
          console.log('active!');
        },
        notifyInactive: (context, event) => {
          console.log('inactive!');
        },
        sendTelemetry: (context, event) => {
          console.log('time:', Date.now());
        }
      }
    
})

  const lightswitch = interpret(light).onTransition((state) => {console.log(state.value)})

lightswitch.start()

lightswitch.send('TOGGLE')
lightswitch.send('TOGGLE')
lightswitch.send('TOGGLE')

lightswitch.stop()

