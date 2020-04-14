let taskDefinition;
window.onload = () => {
  const ELEMS = {
    message: document.getElementById('messageText'),
    projectSelect: document.getElementById('projects'),
    scheduleExtend: document.getElementById('scheduleDetails'),
    scheduleSelect: document.getElementById('schedule'),
    popupBody: document.getElementById('popup'),
    cancelAction: document.getElementById('cancelAction'),
    createAction: document.getElementById('createAction')
  };

  const addSelectOption = (selectElem, optionContent, optionValue, selected) => {
    const option = document.createElement('option');
    option.textContent = optionContent;
    option.value = optionValue;
    option.selected = selected;
    selectElem.appendChild(option);
  };

  const addProjectOption = (project, selected) => {
    addSelectOption(ELEMS.projectSelect, project.name, project.id, selected);
  };

  const addScheduleOption = (schedule, selected) => {
    addSelectOption(ELEMS.scheduleSelect, schedule, schedule, selected);
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
      projectId: parseInt(ELEMS.projectSelect.value),
      schedule: ELEMS.scheduleSelect.value
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

    if (!popupData.scheduleEnabled) {
      ELEMS.scheduleExtend.classList.add('hidden');
    }

    const scheduleOptions = popupData.scheduleOptions;
    addScheduleOption('None', true);
    scheduleOptions.forEach((schedule) => addScheduleOption(schedule, false));

    ELEMS.popupBody.classList.remove('hidden');
    ELEMS.message.focus();
  };

  chrome.runtime.onMessage.addListener(function (request) {
    if (request.destination === 'POPUP') {
      actionHandlers[request.action](request.payload);
    }
  });
};