# Mattermost Tasks Plugin

Mattermost 채널에 작업목록을 추가합니다.

Add a Task to the Mattermost channel.

## Usage

### Slash Commands

슬래시 명령어를 통해 현재 설정된 메모장을 확인 할 수 있습니다. 슬래시 명령어의 경우 보기만 지원합니다.

**채널의 작업 목록 출력**

```
/tasks show
```

```
#### 채널의 작업목록
|NUM|TASK_ID|TASK_TITLE|USER|
|---|---|---|---|
|1|o7dqwiere3rrbgkzzrb4kq87wc|aaaaaaaaaaaa|admin|
|2|i8q56teo4ife7gapbq77rq8hdc|new 한글입력 테스트 중입니다|admin|
|3|hxqtg6mrrfdg3btk9bz31a6auy|2023-07-13 방문간 확인할 내용|admin|
```

**채널의 새로운 작업 목록을 추가**

```
/tasks new [task_title]
```

```
msg: Created new Task
task_id, task_title, user_id
```

**채널의 작업 목록 제거**

```
/tasks delete [#task_id]
```

```
msg: delete task_id complite.
```

**작업 목록 하위 할일 목록 출력**

```
/tasks list [#task_id]
```

```
job_id, job_title, job_content, job_status, user_id
```

**작업 목록에 할일 목록 추가**

```
/tasks add [#task_id] [job_title] [job_content]
```

```
msg: add new job in task_id
task_id, job_id, job_title, job_content, job_status, user_id
```

**작업 목록의 할일 목록 삭제**

```
/tasks remove [#task_id] [#job_id]
```

```
msg: remove task_id and job_id complite
```

**작업 목록의 할일 목록의 상태 변경**

```
/tasks status [#task_id] [#job_id] [open|done]
```

```
msg: change status is open or done task_id and job_id
```
