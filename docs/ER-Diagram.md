[     USER     ] 1 --------1 [     PROFILE      ]
| user_id (PK) |             | profile_id (PK)  |
| email (UQ)   |             | user_id (FK)     |
| password_hash|             | first_name       |
| role (Enum)  |             | last_name        |
| created_at   |             | graduation_year  |
                             | degree           |
                             | current_company  |
                             | job_title        |
                             | bio              |
                             | location         |
                             | linkedin_url     |

       |
       | 1:N
       |
       ├------------------┐
       |                  |
       ▼ 1:N              ▼ 1:N
[   CONNECTION   ]        [     MESSAGE    ]
| conn_id (PK)    |       | message_id(PK) |
| requester_id(FK)|       | sender_id (FK) |
| receiver_id (FK)|       | receiver_id(FK)|
| status (Enum)   |       | content text   |
| sent_at         |       | sent_at        |
| updated_at      |       | is_read        | 

       |
       | 1:N
       |
       ├------------------┐
       |                  |
       ▼ 1:N              ▼ 1:N
[   JOB_POSTING  ]    [      EVENT      ]
| job_id (PK)    |    | event_id (PK)   |
| posted_by(FK)  |    | organizer_id(FK)|
| title          |    | title           |
| company        |    | description     |
| location       |    | start_time      |
| description    |    | end_time        |
| application_url|    | location        |
| posted_at      |    | event_type(Enum)|

       |                  |
       |                  | 1:N
       |                  |
       |                  ▼
       |           [  EVENT_ATTENDEE  ]
       |           | event_id (PK, FK)|
       └---------- | user_id (PK, FK) |
               N:M | status (Enum)    |
                   | registered_at    |