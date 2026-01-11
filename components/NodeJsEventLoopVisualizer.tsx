'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Code2, BookOpen } from 'lucide-react';

type LogType = 'info' | 'queue' | 'output' | 'phase' | 'complete';

type LogEntry = {
  message: string;
  type: LogType;
  timestamp: number;
};

type ParsedTasks = {
  sync: string[];
  timers: string[];
  immediate: string[];
  nextTick: string[];
  promises: string[];
};

const NodeJsEventLoopVisualizer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [callStack, setCallStack] = useState<string[]>([]);
  const [timersQueue, setTimersQueue] = useState<string[]>([]);
  const [pendingQueue, setPendingQueue] = useState<string[]>([]);
  const [pollQueue, setPollQueue] = useState<string[]>([]);
  const [checkQueue, setCheckQueue] = useState<string[]>([]);
  const [closeQueue, setCloseQueue] = useState<string[]>([]);
  const [nextTickQueue, setNextTickQueue] = useState<string[]>([]);
  const [microTaskQueue, setMicroTaskQueue] = useState<string[]>([]);
  const [speed, setSpeed] = useState(1000);
  const [selectedExample, setSelectedExample] = useState('basic');

  const examples = {
    basic: {
      name: 'Basic Example',
      description: 'Understanding execution order',
      code: `console.log('Start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

setImmediate(() => {
  console.log('setImmediate');
});

process.nextTick(() => {
  console.log('nextTick');
});

Promise.resolve().then(() => {
  console.log('Promise');
});

console.log('End');`
    },
    timersVsImmediate: {
      name: 'setTimeout vs setImmediate',
      description: 'When does each execute?',
      code: `setTimeout(() => {
  console.log('setTimeout 1');
}, 0);

setTimeout(() => {
  console.log('setTimeout 2');
}, 0);

setImmediate(() => {
  console.log('setImmediate 1');
});

setImmediate(() => {
  console.log('setImmediate 2');
});

console.log('Main code');`
    },
    nextTickRecursion: {
      name: 'process.nextTick() Behavior',
      description: 'nextTick executes before everything',
      code: `console.log('Start');

process.nextTick(() => {
  console.log('nextTick 1');
});

process.nextTick(() => {
  console.log('nextTick 2');
});

Promise.resolve().then(() => {
  console.log('Promise 1');
});

setTimeout(() => {
  console.log('setTimeout');
}, 0);

console.log('End');`
    },
    microTaskQueue: {
      name: 'Microtask Queue Priority',
      description: 'nextTick vs Promise microtasks',
      code: `process.nextTick(() => {
  console.log('nextTick 1');
});

Promise.resolve().then(() => {
  console.log('Promise 1');
});

Promise.resolve().then(() => {
  console.log('Promise 2');
});

process.nextTick(() => {
  console.log('nextTick 2');
});

console.log('Sync code');`
    },
    nestedTimers: {
      name: 'Nested Timers',
      description: 'Understanding timer phases',
      code: `setTimeout(() => {
  console.log('Timeout 1');
}, 0);

setTimeout(() => {
  console.log('Timeout 2');
}, 0);

setImmediate(() => {
  console.log('Immediate 1');
});

setImmediate(() => {
  console.log('Immediate 2');
});

console.log('Main');`
    },
    ioExample: {
      name: 'Complex Example',
      description: 'All features combined',
      code: `console.log('Start');

setTimeout(() => {
  console.log('Timer 1');
  process.nextTick(() => {
    console.log('nextTick inside timer');
  });
}, 0);

setImmediate(() => {
  console.log('Immediate 1');
});

process.nextTick(() => {
  console.log('nextTick 1');
});

Promise.resolve().then(() => {
  console.log('Promise 1');
});

console.log('End');`
    }
  };

  const [code, setCode] = useState(examples.basic.code);

  const phases = [
    {
      name: 'Timers',
      color: 'bg-purple-500',
      queue: timersQueue,
      description: 'setTimeout, setInterval callbacks'
    },
    {
      name: 'Pending I/O',
      color: 'bg-blue-500',
      queue: pendingQueue,
      description: 'I/O callbacks deferred to next iteration'
    },
    {
      name: 'Poll',
      color: 'bg-green-500',
      queue: pollQueue,
      description: 'Retrieve new I/O events, execute callbacks'
    },
    {
      name: 'Check',
      color: 'bg-yellow-500',
      queue: checkQueue,
      description: 'setImmediate callbacks'
    },
    {
      name: 'Close',
      color: 'bg-red-500',
      queue: closeQueue,
      description: 'Close event callbacks (socket.on("close"))'
    }
  ];

  const addLog = (message: string, type: LogType = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  const parseCode = (): ParsedTasks => {
    const tasks: ParsedTasks = {
      sync: [],
      timers: [],
      immediate: [],
      nextTick: [],
      promises: []
    };

    const lines = code.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();

      if (trimmed.startsWith('console.log')) {
        const match = trimmed.match(/console\.log\(['"](.+?)['"]\)/);
        if (match) {
          tasks.sync.push(match[1]);
        }
      } else if (trimmed.includes('setTimeout')) {
        const contentMatch = line.match(/console\.log\(['"](.+?)['"]\)/);
        if (contentMatch) {
          tasks.timers.push(contentMatch[1]);
        }
      } else if (trimmed.includes('setImmediate')) {
        const contentMatch = line.match(/console\.log\(['"](.+?)['"]\)/);
        if (contentMatch) {
          tasks.immediate.push(contentMatch[1]);
        }
      } else if (trimmed.includes('process.nextTick')) {
        const contentMatch = line.match(/console\.log\(['"](.+?)['"]\)/);
        if (contentMatch) {
          tasks.nextTick.push(contentMatch[1]);
        }
      } else if (trimmed.includes('Promise.resolve()')) {
        const contentMatch = line.match(/console\.log\(['"](.+?)['"]\)/);
        if (contentMatch) {
          tasks.promises.push(contentMatch[1]);
        }
      }
    });

    return tasks;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runExecution = async () => {
    const tasks = parseCode();
    const timers: string[] = [];
    const immediates: string[] = [];
    const nextTicks: string[] = [];
    const microTasks: string[] = [];

    for (let i = 0; i < tasks.sync.length; i += 1) {
      const msg = tasks.sync[i];
      setCallStack([msg]);
      await sleep(speed);
      addLog(msg, 'output');
      setCallStack([]);
      await sleep(speed / 2);

      if (i === 0) {
        for (const timer of tasks.timers) {
          timers.push(timer);
          setTimersQueue([...timers]);
          addLog(`Queue: ${timer} → Timers`, 'queue');
          await sleep(speed / 3);
        }

        for (const imm of tasks.immediate) {
          immediates.push(imm);
          setCheckQueue([...immediates]);
          addLog(`Queue: ${imm} → Check`, 'queue');
          await sleep(speed / 3);
        }

        for (const tick of tasks.nextTick) {
          nextTicks.push(tick);
          setNextTickQueue([...nextTicks]);
          addLog(`Queue: ${tick} → nextTick`, 'queue');
          await sleep(speed / 3);
        }

        for (const promise of tasks.promises) {
          microTasks.push(promise);
          setMicroTaskQueue([...microTasks]);
          addLog(`Queue: ${promise} → Microtask`, 'queue');
          await sleep(speed / 3);
        }

        await sleep(speed / 2);
      }
    }

    await sleep(speed);

    if (nextTicks.length > 0) {
      setCurrentPhase(-2);
      addLog('--- Executing nextTick Queue ---', 'phase');
      await sleep(speed);

      while (nextTicks.length > 0) {
        const msg = nextTicks.shift();
        setNextTickQueue([...nextTicks]);
        await sleep(speed / 2);
        if (msg) {
          addLog(msg, 'output');
        }
        await sleep(speed);
      }

      setCurrentPhase(-1);
      await sleep(speed / 2);
    }

    if (microTasks.length > 0) {
      setCurrentPhase(-1);
      addLog('--- Executing Microtask Queue ---', 'phase');
      await sleep(speed);

      while (microTasks.length > 0) {
        const msg = microTasks.shift();
        setMicroTaskQueue([...microTasks]);
        await sleep(speed / 2);
        if (msg) {
          addLog(msg, 'output');
        }
        await sleep(speed);
      }

      setCurrentPhase(-1);
      await sleep(speed / 2);
    }

    if (timers.length > 0) {
      setCurrentPhase(0);
      addLog('--- Entering Timers Phase ---', 'phase');
      await sleep(speed);

      while (timers.length > 0) {
        const msg = timers.shift();
        setTimersQueue([...timers]);
        await sleep(speed / 2);
        if (msg) {
          addLog(msg, 'output');
        }
        await sleep(speed);
      }

      setCurrentPhase(-1);
      await sleep(speed / 2);
    }

    setCurrentPhase(1);
    addLog('--- Pending I/O Phase (Empty) ---', 'phase');
    await sleep(speed / 2);
    setCurrentPhase(-1);
    await sleep(speed / 4);

    setCurrentPhase(2);
    addLog('--- Poll Phase (Empty) ---', 'phase');
    await sleep(speed / 2);
    setCurrentPhase(-1);
    await sleep(speed / 4);

    if (immediates.length > 0) {
      setCurrentPhase(3);
      addLog('--- Entering Check Phase ---', 'phase');
      await sleep(speed);

      while (immediates.length > 0) {
        const msg = immediates.shift();
        setCheckQueue([...immediates]);
        await sleep(speed / 2);
        if (msg) {
          addLog(msg, 'output');
        }
        await sleep(speed);
      }

      setCurrentPhase(-1);
      await sleep(speed / 2);
    }

    setCurrentPhase(4);
    addLog('--- Close Phase (Empty) ---', 'phase');
    await sleep(speed / 2);
    setCurrentPhase(-1);

    addLog('--- Event Loop Complete ---', 'complete');
    setIsRunning(false);
  };

  const handleRun = () => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      return;
    }

    handleReset();
    setIsRunning(true);
    runExecution();
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setLogs([]);
    setCallStack([]);
    setTimersQueue([]);
    setPendingQueue([]);
    setPollQueue([]);
    setCheckQueue([]);
    setCloseQueue([]);
    setNextTickQueue([]);
    setMicroTaskQueue([]);
    setCurrentPhase(-1);
  };

  const handleExampleChange = (exampleKey: string) => {
    handleReset();
    setSelectedExample(exampleKey);
    setCode(examples[exampleKey as keyof typeof examples].code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Code2 className="text-green-400" size={32} />
            Node.js Event Loop Visualizer
          </h1>
          <p className="text-gray-400">Interactive visualization of Node.js asynchronous execution model</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 mb-4 shadow-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="text-blue-400" size={20} />
            <h2 className="text-lg font-semibold text-white">Examples</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                onClick={() => handleExampleChange(key)}
                disabled={isRunning}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  selectedExample === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {example.name}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-2">{examples[selectedExample as keyof typeof examples].description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-3">Code Editor</h2>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={isRunning}
              className="w-full h-72 bg-slate-900 text-green-400 font-mono text-sm p-3 rounded border border-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              spellCheck={false}
            />

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Speed: {speed}ms</label>
                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="100"
                  value={speed}
                  onChange={e => setSpeed(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Play size={18} />
                  {isPaused ? 'Resume' : 'Run'}
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Call Stack (Synchronous Code)</h3>
              <div className="min-h-20 bg-slate-900 rounded p-3 border border-slate-600">
                {callStack.length === 0 ? (
                  <p className="text-gray-500 text-sm">Empty</p>
                ) : (
                  callStack.map((item, i) => (
                    <div key={i} className="bg-blue-600 text-white px-3 py-2 rounded mb-1 animate-pulse font-mono">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={`bg-slate-800 rounded-lg p-4 shadow-xl border-2 transition-all ${
                  currentPhase === -2 ? 'border-orange-400 shadow-orange-400/50 scale-105' : 'border-slate-700'
                }`}
              >
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="bg-orange-600 w-3 h-3 rounded-full"></span>
                  process.nextTick()
                </h3>
                <p className="text-xs text-gray-400 mb-2">Highest priority - runs before microtasks</p>
                <div className="min-h-16 bg-slate-900 rounded p-2 border border-slate-600">
                  {nextTickQueue.length === 0 ? (
                    <p className="text-gray-600 text-xs">Empty</p>
                  ) : (
                    nextTickQueue.map((item, i) => (
                      <div key={i} className="bg-orange-600 text-white px-2 py-1 rounded mb-1 text-xs font-mono animate-pulse">
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div
                className={`bg-slate-800 rounded-lg p-4 shadow-xl border-2 transition-all ${
                  currentPhase === -1 && microTaskQueue.length > 0
                    ? 'border-pink-400 shadow-pink-400/50 scale-105'
                    : 'border-slate-700'
                }`}
              >
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="bg-pink-600 w-3 h-3 rounded-full"></span>
                  Microtask Queue
                </h3>
                <p className="text-xs text-gray-400 mb-2">Promises - runs after nextTick</p>
                <div className="min-h-16 bg-slate-900 rounded p-2 border border-slate-600">
                  {microTaskQueue.length === 0 ? (
                    <p className="text-gray-600 text-xs">Empty</p>
                  ) : (
                    microTaskQueue.map((item, i) => (
                      <div key={i} className="bg-pink-600 text-white px-2 py-1 rounded mb-1 text-xs font-mono animate-pulse">
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Event Loop Phases (libuv)</h3>
              <div className="space-y-2">
                {phases.map((phase, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-3 border-2 transition-all ${
                      currentPhase === index ? 'border-white shadow-lg shadow-white/30 scale-105' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`${phase.color} text-white px-3 py-1 rounded text-sm font-semibold`}>
                          {index + 1}. {phase.name}
                        </span>
                        {currentPhase === index && (
                          <span className="text-green-400 text-xs animate-pulse flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Executing
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{phase.description}</p>
                    <div className="bg-slate-900 rounded p-2 min-h-12 border border-slate-600">
                      {phase.queue.length === 0 ? (
                        <p className="text-gray-600 text-xs">Empty</p>
                      ) : (
                        phase.queue.map((item, i) => (
                          <div key={i} className={`${phase.color} text-white px-2 py-1 rounded mb-1 text-xs font-mono animate-pulse`}>
                            {item}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Console Output</h3>
              <div className="bg-slate-900 rounded p-3 min-h-32 max-h-64 overflow-y-auto border border-slate-600 font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500">Waiting for execution...</p>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className={`mb-1 ${
                        log.type === 'output'
                          ? 'text-green-400'
                          : log.type === 'phase'
                          ? 'text-yellow-400 font-semibold'
                          : log.type === 'complete'
                          ? 'text-cyan-400 font-semibold'
                          : 'text-blue-400'
                      }`}
                    >
                      {log.type === 'output' ? '→' : log.type === 'phase' ? '▶' : log.type === 'complete' ? '✓' : '+'}{' '}
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">Execution Order</h3>
            <ol className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold mt-0.5">1</span>
                <span>Synchronous code (Call Stack)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-xs font-bold mt-0.5">2</span>
                <span>process.nextTick() callbacks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-pink-600 text-white px-2 py-0.5 rounded text-xs font-bold mt-0.5">3</span>
                <span>Promise microtasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold mt-0.5">4</span>
                <span>Event Loop phases (Timers → Pending → Poll → Check → Close)</span>
              </li>
            </ol>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">Key Differences from Browser</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong className="text-orange-400">process.nextTick()</strong> - Node.js only, executes before any I/O
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong className="text-yellow-400">setImmediate()</strong> - Node.js only, runs after I/O events
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Six distinct phases vs browser's simpler model</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Built on libuv for cross-platform async I/O</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeJsEventLoopVisualizer;
