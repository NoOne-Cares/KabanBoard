import React, { useMemo, useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [groupBy, setGroupBy] = useState('status');
  const [sortBy, setSortBy] = useState('priority');
  const statusOrder = ["Backlog", "Todo", "In progress", "Done"];

  const formatClassName = (key) => {
    return key
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .trim();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTasks(data.tickets);
        setUsers(data.users);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };
    fetchData();
  }, []);

  const userMap = useMemo(() => {
    return users.reduce((map, user) => {
      map[user.id] = {
        name: user.name,
        available: user.available
      };
      return map;
    }, {});
  }, [users]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    return tasks.reduce((accumulator, task) => {
      let key;
      switch (groupBy) {
        case 'status':
          key = task.status;
          break;
        case 'priority':
          key = task.priority;
          break;
        case 'user':
          key = userMap[task.userId]?.name || 'Unknown';
          break;
        default:
          key = 'Unknown';
      }
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(task);
      return accumulator;
    }, {});
  }, [groupBy, tasks, userMap]);

  // Sort tasks within each group
  const sortedGroupedTasks = useMemo(() => {
    const sortedGroups = Object.entries(groupedTasks).map(([key, tasks]) => {
      const sortedTasks = [...tasks].sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            return b.priority - a.priority;
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
      return [key, sortedTasks];
    });

    return sortedGroups.sort(([keyA], [keyB]) => {
      if (groupBy === 'status') {
        return statusOrder.indexOf(keyA) - statusOrder.indexOf(keyB);
      }
      return keyA > keyB ? 1 : -1;
    });
  }, [groupedTasks, sortBy, groupBy, userMap]);

  return (
    <div>
      <div className='nav'>
        <div className='menu' onClick={() => setShowDrop(!showDrop)}>
          <div className='displayImage'></div>
          <div>Display</div>
          <div className='menuImage'></div>
        </div>
      </div>
      {showDrop && (
        <div className='dropdownContainer'>
          <div>
            <label>
              Group by:
              <select className="select options" onChange={(e) => setGroupBy(e.target.value)} value={groupBy}>
                <option className="select" value="status">Status</option>
                <option className="select" value="priority">Priority</option>
                <option className="select" value="user">User</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Sort by:
              <select className="select2" onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                <option className="select2" value="priority">Priority</option>
                <option className="select2" value="title">Title</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <div className='groups-wrapper'>
        {sortedGroupedTasks.map(([key, tasks]) => {
          const formattedKey = formatClassName(groupBy === 'priority' ? `Priority ${key}` : key);
          return (
            <div key={key} className='child'>
              <div className='container'>
                <div className='headingContainer s'>
                  <div className={`cont ${formattedKey}`}></div>
                  <div className='headingText'>{groupBy === 'priority' ? `Priority ${key}` : key} {tasks.length}</div>
                  <div className='add'></div>
                  <div className='threeDot'></div>
                </div>
                <div className='cardContainer'>
                  {tasks.map(task => {
                    const user = userMap[task.userId] || { name: 'Unknown', available: false };

                    return (
                      <div key={task.id} className='Card'>
                        <div className='taskHeading'>
                          <div className='taskId'><div>{task.id}</div></div>
                          <div className='available'>
                            <div className={`isAvailable ${user.available ? 'box-yellow' : 'box-grey'}`}></div>
                            <div className={`userImage ${user.name.replace(" ", "-").toLowerCase()}`}></div>
                          </div>
                        </div>

                        <div className='taskNameContainer'>
                          <div>
                            <div className={`priority ${task.status.replace(" ", "")}`} />
                          </div>
                          <div>
                            <div className='titleText'>{task.title}</div>
                          </div>
                        </div>
                        <div className='featureGroup'>
                          <div className='circle'></div>
                          <div className='feature'>{task.tag[0]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;

