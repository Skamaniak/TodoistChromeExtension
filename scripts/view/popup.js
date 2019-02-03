let taskDefinition;
window.onload = () => {
  const ELEMS = {
    message: document.getElementById('messageText'),
    projectSelect: document.getElementById('projects'),
    popupBody: document.getElementById('popup'),
    cancelAction: document.getElementById('cancelAction'),
    createAction: document.getElementById('createAction')
  };

  const addProjectOption = (project, selected) => {
    const option = document.createElement('option');
    option.textContent = project.name;
    option.value = project.id;
    option.selected = selected;
    ELEMS.projectSelect.appendChild(option);
  };

  top.MESSAGE_BUS.TO_BACKEND.scheduleTaskCreation();

  let schedulingInterrupted = false;
  const cancelScheduledTaskCreation = () => {
    if (!schedulingInterrupted) {
      top.MESSAGE_BUS.TO_BACKEND.cancelScheduledTaskCreation();
      schedulingInterrupted = true;
    }
  };
  ELEMS.popupBody.onclick = cancelScheduledTaskCreation;
  ELEMS.popupBody.onkeydown = cancelScheduledTaskCreation;
  ELEMS.popupBody.onblur = cancelScheduledTaskCreation;

  ELEMS.createAction.onclick = (e) => {
    e.stopPropagation();
    const extraDetails = {
      message: ELEMS.message.value,
      projectId: parseInt(ELEMS.projectSelect.value)
    };
    const task = Object.assign(taskDefinition, extraDetails);
    top.MESSAGE_BUS.TO_BACKEND.createTask(task);
  };

  ELEMS.cancelAction.onclick = () => window.close();

  const actionHandlers = {};
  actionHandlers[top.MESSAGE_BUS.ACTIONS.closePopup] = () => {
    window.close();
  };
  actionHandlers[top.MESSAGE_BUS.ACTIONS.popupData] = (popupData) => {
    taskDefinition = popupData.taskDefinition;
    const projects = popupData.projects;
    projects.forEach((project) => addProjectOption(project, project.name === 'Inbox'));
    ELEMS.popupBody.classList.remove('hidden');
    ELEMS.message.focus();
  };

  chrome.runtime.onMessage.addListener(function (request) {
    if (request.destination === 'POPUP') {
      actionHandlers[request.action](request.payload);
    }
  });
};