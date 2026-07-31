<!-- Generator: Widdershins v4.0.1 -->

<h1 id="empay-hrms-api">EmPay HRMS API v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

REST API contract derived from the Express routes, controllers, services, and
database schema. Protected operations require the `Authorization: Bearer <JWT>`
request header. Individual operation descriptions identify additional role
restrictions.

Base URLs:

* <a href="http://localhost:5000">http://localhost:5000</a>

# Authentication

- HTTP Authentication, scheme: bearer 

<h1 id="empay-hrms-api-health">Health</h1>

## Check API health

<a id="opIdgetHealth"></a>

> Code samples

```http
GET http://localhost:5000/api/health HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/health`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "timestamp": "2019-08-24T14:15:22Z"
}
```

<h3 id="check-api-health-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|API is running|[HealthResponse](#schemahealthresponse)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="empay-hrms-api-auth">Auth</h1>

## Register a user

<a id="opIdregisterUser"></a>

> Code samples

```http
POST http://localhost:5000/api/auth/register HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/auth/register`

Requires the `admin` or `hr_officer` role.

> Body parameter

```json
{
  "full_name": "string",
  "email": "user@example.com",
  "password": "pa$$word",
  "role": "admin",
  "department": "string",
  "designation": "string",
  "phone": "string"
}
```

<h3 id="register-a-user-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RegisterRequest](#schemaregisterrequest)|true|none|
|» full_name|body|string|true|none|
|» email|body|string(email)|true|none|
|» password|body|string(password)|true|none|
|» role|body|[UserRole](#schemauserrole)|true|none|
|» department|body|string¦null|false|none|
|» designation|body|string¦null|false|none|
|» phone|body|string¦null|false|none|

#### Enumerated Values

|Parameter|Value|
|---|---|
|» role|admin|
|» role|hr_officer|
|» role|employee|
|» role|payroll_officer|

> Example responses

> 201 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "full_name": "string",
    "email": "user@example.com",
    "role": "admin",
    "department": "string",
    "designation": "string",
    "phone": "string",
    "profile_pic": "string",
    "date_joined": "2019-08-24",
    "is_active": true,
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z"
  }
}
```

<h3 id="register-a-user-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|User registered|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Email already exists|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="register-a-user-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Log in

<a id="opIdlogin"></a>

> Code samples

```http
POST http://localhost:5000/api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/auth/login`

> Body parameter

```json
{
  "email": "user@example.com",
  "password": "pa$$word"
}
```

<h3 id="log-in-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[LoginRequest](#schemaloginrequest)|true|none|
|» email|body|string(email)|true|none|
|» password|body|string(password)|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "token": "string",
    "user": {
      "id": 0,
      "full_name": "string",
      "email": "user@example.com",
      "role": "admin",
      "department": "string",
      "designation": "string",
      "phone": "string",
      "profile_pic": "string",
      "date_joined": "2019-08-24",
      "is_active": true,
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z"
    }
  }
}
```

<h3 id="log-in-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Login successful|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="log-in-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

<aside class="success">
This operation does not require authentication
</aside>

## Get the authenticated user's profile

<a id="opIdgetCurrentUser"></a>

> Code samples

```http
GET http://localhost:5000/api/auth/me HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/auth/me`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "full_name": "string",
    "email": "user@example.com",
    "role": "admin",
    "department": "string",
    "designation": "string",
    "phone": "string",
    "profile_pic": "string",
    "date_joined": "2019-08-24",
    "is_active": true,
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z"
  }
}
```

<h3 id="get-the-authenticated-user's-profile-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Profile fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-the-authenticated-user's-profile-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Request a password reset

<a id="opIdforgotPassword"></a>

> Code samples

```http
POST http://localhost:5000/api/auth/forgot-password HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/auth/forgot-password`

> Body parameter

```json
{
  "email": "user@example.com"
}
```

<h3 id="request-a-password-reset-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» email|body|string(email)|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string"
}
```

<h3 id="request-a-password-reset-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Generic success response, whether or not the account exists|[MessageResponse](#schemamessageresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## Reset a password

<a id="opIdresetPassword"></a>

> Code samples

```http
POST http://localhost:5000/api/auth/reset-password HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/auth/reset-password`

> Body parameter

```json
{
  "token": "string",
  "newPassword": "pa$$word"
}
```

<h3 id="reset-a-password-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» token|body|string|true|none|
|» newPassword|body|string(password)|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string"
}
```

<h3 id="reset-a-password-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Password reset|[MessageResponse](#schemamessageresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## Send an SMTP test email

<a id="opIdtestEmail"></a>

> Code samples

```http
POST http://localhost:5000/api/auth/test-email HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/auth/test-email`

Requires the `admin` role. If `email` is omitted, the authenticated user's email is used.

> Body parameter

```json
{
  "email": "user@example.com"
}
```

<h3 id="send-an-smtp-test-email-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» email|body|string(email)|false|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string"
}
```

<h3 id="send-an-smtp-test-email-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Test email sent|[MessageResponse](#schemamessageresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-users">Users</h1>

## List users

<a id="opIdlistUsers"></a>

> Code samples

```http
GET http://localhost:5000/api/users HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/users`

Available to all authenticated roles.

<h3 id="list-users-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|role|query|[UserRole](#schemauserrole)|false|none|
|department|query|string|false|none|
|search|query|string|false|none|
|is_active|query|boolean|false|Filter by active status.|

#### Enumerated Values

|Parameter|Value|
|---|---|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "full_name": "string",
      "email": "user@example.com",
      "role": "admin",
      "department": "string",
      "designation": "string",
      "phone": "string",
      "profile_pic": "string",
      "date_joined": "2019-08-24",
      "is_active": true,
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z"
    }
  ]
}
```

<h3 id="list-users-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Users fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-users-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Upload the authenticated user's avatar

<a id="opIduploadAvatar"></a>

> Code samples

```http
POST http://localhost:5000/api/users/me/avatar HTTP/1.1
Host: localhost:5000
Content-Type: multipart/form-data
Accept: application/json

```

`POST /api/users/me/avatar`

> Body parameter

```yaml
avatar: string

```

<h3 id="upload-the-authenticated-user's-avatar-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» avatar|body|string(binary)|true|JPG, JPEG, PNG, or WebP image, maximum 5 MB.|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "profile_pic": "http://example.com"
  }
}
```

<h3 id="upload-the-authenticated-user's-avatar-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Profile picture updated|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="upload-the-authenticated-user's-avatar-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get a user

<a id="opIdgetUser"></a>

> Code samples

```http
GET http://localhost:5000/api/users/{id} HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/users/{id}`

Employees may only view their own profile.

<h3 id="get-a-user-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "full_name": "string",
    "email": "user@example.com",
    "role": "admin",
    "department": "string",
    "designation": "string",
    "phone": "string",
    "profile_pic": "string",
    "date_joined": "2019-08-24",
    "is_active": true,
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z"
  }
}
```

<h3 id="get-a-user-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-a-user-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Update a user

<a id="opIdupdateUser"></a>

> Code samples

```http
PUT http://localhost:5000/api/users/{id} HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`PUT /api/users/{id}`

Employees and payroll officers may update only themselves; HR officers may update themselves or employees; only admins may change `role` or `password`.

> Body parameter

```json
{
  "full_name": "string",
  "department": "string",
  "designation": "string",
  "phone": "string",
  "profile_pic": "string",
  "role": "admin",
  "password": "pa$$word"
}
```

<h3 id="update-a-user-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UpdateUserRequest](#schemaupdateuserrequest)|true|none|
|» full_name|body|string|false|none|
|» department|body|string|false|none|
|» designation|body|string|false|none|
|» phone|body|string|false|none|
|» profile_pic|body|string|false|none|
|» role|body|[UserRole](#schemauserrole)|false|none|
|» password|body|string(password)|false|none|
|id|path|integer|true|none|

#### Enumerated Values

|Parameter|Value|
|---|---|
|» role|admin|
|» role|hr_officer|
|» role|employee|
|» role|payroll_officer|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "full_name": "string",
    "email": "user@example.com",
    "role": "admin",
    "department": "string",
    "designation": "string",
    "phone": "string",
    "profile_pic": "string",
    "date_joined": "2019-08-24",
    "is_active": true,
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z"
  }
}
```

<h3 id="update-a-user-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User updated|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="update-a-user-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Deactivate a user

<a id="opIddeleteUser"></a>

> Code samples

```http
DELETE http://localhost:5000/api/users/{id} HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`DELETE /api/users/{id}`

Requires the `admin` role. This is a soft delete that sets `is_active` to false.

<h3 id="deactivate-a-user-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "full_name": "string",
    "email": "user@example.com",
    "role": "admin",
    "department": "string",
    "designation": "string",
    "phone": "string",
    "profile_pic": "string",
    "date_joined": "2019-08-24",
    "is_active": true,
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z"
  }
}
```

<h3 id="deactivate-a-user-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User deactivated|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="deactivate-a-user-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Toggle a user's active status

<a id="opIdtoggleUserActive"></a>

> Code samples

```http
PATCH http://localhost:5000/api/users/{id}/toggle-active HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`PATCH /api/users/{id}/toggle-active`

Requires the `admin` role.

<h3 id="toggle-a-user's-active-status-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "full_name": "string",
    "email": "user@example.com",
    "role": "admin",
    "department": "string",
    "designation": "string",
    "phone": "string",
    "profile_pic": "string",
    "date_joined": "2019-08-24",
    "is_active": true,
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z"
  }
}
```

<h3 id="toggle-a-user's-active-status-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User status toggled|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="toggle-a-user's-active-status-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-attendance">Attendance</h1>

## Check in or check out

<a id="opIdmarkAttendance"></a>

> Code samples

```http
POST http://localhost:5000/api/attendance/mark HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`POST /api/attendance/mark`

Marks attendance for the authenticated user. Repeated calls alternate between check-in and check-out behavior.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "action": "checked_in",
    "record": {
      "id": 0,
      "employee_id": 0,
      "date": "2019-08-24",
      "check_in": "string",
      "check_out": "string",
      "accumulated_minutes": 0,
      "duration_minutes": 0,
      "status": "present",
      "created_at": "2019-08-24T14:15:22Z",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string",
      "profile_pic": "string"
    }
  }
}
```

<h3 id="check-in-or-check-out-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Attendance marked|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="check-in-or-check-out-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|action|checked_in|
|action|checked_out|
|status|present|
|status|absent|
|status|half_day|
|status|on_leave|
|status|unpaid_leave|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get the authenticated user's monthly attendance

<a id="opIdgetMyAttendance"></a>

> Code samples

```http
GET http://localhost:5000/api/attendance/my HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/attendance/my`

<h3 id="get-the-authenticated-user's-monthly-attendance-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|month|query|integer|false|Defaults to the current month.|
|year|query|integer|false|Defaults to the current year.|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "employee_id": 0,
      "date": "2019-08-24",
      "check_in": "string",
      "check_out": "string",
      "accumulated_minutes": 0,
      "duration_minutes": 0,
      "status": "present",
      "created_at": "2019-08-24T14:15:22Z",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string",
      "profile_pic": "string"
    }
  ]
}
```

<h3 id="get-the-authenticated-user's-monthly-attendance-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Attendance fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-the-authenticated-user's-monthly-attendance-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|present|
|status|absent|
|status|half_day|
|status|on_leave|
|status|unpaid_leave|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get a monthly attendance summary

<a id="opIdgetMonthlyAttendanceSummary"></a>

> Code samples

```http
GET http://localhost:5000/api/attendance/monthly-summary HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/attendance/monthly-summary`

Defaults to the authenticated user when `employee_id` is omitted.

<h3 id="get-a-monthly-attendance-summary-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|employee_id|query|integer|false|none|
|month|query|integer|false|Defaults to the current month.|
|year|query|integer|false|Defaults to the current year.|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "present": "string",
    "absent": "string",
    "half_day": "string",
    "on_leave": "string",
    "total_working_days": "string"
  }
}
```

<h3 id="get-a-monthly-attendance-summary-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Summary fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-a-monthly-attendance-summary-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## List monthly attendance for all employees

<a id="opIdlistAllAttendance"></a>

> Code samples

```http
GET http://localhost:5000/api/attendance/all HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/attendance/all`

Requires the `admin`, `hr_officer`, or `payroll_officer` role.

<h3 id="list-monthly-attendance-for-all-employees-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|month|query|integer|false|Defaults to the current month.|
|year|query|integer|false|Defaults to the current year.|
|department|query|string|false|none|
|employee_id|query|integer|false|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "employee_id": 0,
      "date": "2019-08-24",
      "check_in": "string",
      "check_out": "string",
      "accumulated_minutes": 0,
      "duration_minutes": 0,
      "status": "present",
      "created_at": "2019-08-24T14:15:22Z",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string",
      "profile_pic": "string"
    }
  ]
}
```

<h3 id="list-monthly-attendance-for-all-employees-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Attendance fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-monthly-attendance-for-all-employees-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|present|
|status|absent|
|status|half_day|
|status|on_leave|
|status|unpaid_leave|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## List today's attendance

<a id="opIdgetTodayAttendance"></a>

> Code samples

```http
GET http://localhost:5000/api/attendance/today HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/attendance/today`

Requires the `admin`, `hr_officer`, or `payroll_officer` role.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "employee_id": 0,
      "date": "2019-08-24",
      "check_in": "string",
      "check_out": "string",
      "accumulated_minutes": 0,
      "duration_minutes": 0,
      "status": "present",
      "created_at": "2019-08-24T14:15:22Z",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string",
      "profile_pic": "string"
    }
  ]
}
```

<h3 id="list-today's-attendance-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Today's attendance fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-today's-attendance-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|present|
|status|absent|
|status|half_day|
|status|on_leave|
|status|unpaid_leave|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-leave">Leave</h1>

## List leave types

<a id="opIdlistLeaveTypes"></a>

> Code samples

```http
GET http://localhost:5000/api/leave/types HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/leave/types`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "name": "string",
      "description": "string",
      "max_days_per_year": 0,
      "is_paid": true
    }
  ]
}
```

<h3 id="list-leave-types-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Leave types fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-leave-types-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Create a leave type

<a id="opIdcreateLeaveType"></a>

> Code samples

```http
POST http://localhost:5000/api/leave/types HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/leave/types`

Requires the `admin` role.

> Body parameter

```json
{
  "name": "string",
  "description": "string",
  "max_days_per_year": 365
}
```

<h3 id="create-a-leave-type-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» name|body|string|true|none|
|» description|body|string¦null|false|none|
|» max_days_per_year|body|integer|true|none|

> Example responses

> 201 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "name": "string",
    "description": "string",
    "max_days_per_year": 0,
    "is_paid": true
  }
}
```

<h3 id="create-a-leave-type-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Leave type created|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="create-a-leave-type-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get the authenticated user's leave allocations

<a id="opIdgetMyLeaveAllocations"></a>

> Code samples

```http
GET http://localhost:5000/api/leave/allocation/my HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/leave/allocation/my`

The route is intended to use the authenticated user but currently passes a missing path parameter to the service.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "employee_id": 0,
      "leave_type_id": 0,
      "allocated_days": 0,
      "used_days": 0,
      "year": 0,
      "name": "string",
      "max_days_per_year": 0,
      "remaining": 0
    }
  ]
}
```

<h3 id="get-the-authenticated-user's-leave-allocations-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Allocations fetched when the route implementation is corrected|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-the-authenticated-user's-leave-allocations-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get an employee's leave allocations

<a id="opIdgetEmployeeLeaveAllocations"></a>

> Code samples

```http
GET http://localhost:5000/api/leave/allocation/{employee_id} HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/leave/allocation/{employee_id}`

Requires the `admin` or `hr_officer` role.

<h3 id="get-an-employee's-leave-allocations-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|employee_id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "employee_id": 0,
      "leave_type_id": 0,
      "allocated_days": 0,
      "used_days": 0,
      "year": 0,
      "name": "string",
      "max_days_per_year": 0,
      "remaining": 0
    }
  ]
}
```

<h3 id="get-an-employee's-leave-allocations-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Allocations fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-an-employee's-leave-allocations-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Create or update a leave allocation

<a id="opIdupsertLeaveAllocation"></a>

> Code samples

```http
POST http://localhost:5000/api/leave/allocation HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/leave/allocation`

Requires the `admin` or `hr_officer` role.

> Body parameter

```json
{
  "employee_id": 0,
  "leave_type_id": 0,
  "allocated_days": 0,
  "year": 2000
}
```

<h3 id="create-or-update-a-leave-allocation-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» employee_id|body|integer|true|none|
|» leave_type_id|body|integer|true|none|
|» allocated_days|body|integer|true|none|
|» year|body|integer|false|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "employee_id": 0,
    "leave_type_id": 0,
    "allocated_days": 0,
    "used_days": 0,
    "year": 0,
    "name": "string",
    "max_days_per_year": 0,
    "remaining": 0
  }
}
```

<h3 id="create-or-update-a-leave-allocation-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Allocation saved|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="create-or-update-a-leave-allocation-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Submit a leave request

<a id="opIdcreateLeaveRequest"></a>

> Code samples

```http
POST http://localhost:5000/api/leave/request HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/leave/request`

> Body parameter

```json
{
  "leave_type_id": 0,
  "start_date": "2019-08-24",
  "end_date": "2019-08-24",
  "reason": "string"
}
```

<h3 id="submit-a-leave-request-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» leave_type_id|body|integer|true|none|
|» start_date|body|string(date)|true|none|
|» end_date|body|string(date)|true|none|
|» reason|body|string¦null|false|none|

> Example responses

> 201 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "employee_id": 0,
    "leave_type_id": 0,
    "start_date": "2019-08-24",
    "end_date": "2019-08-24",
    "total_days": 0,
    "reason": "string",
    "status": "pending",
    "reviewed_by": 0,
    "reviewed_at": "2019-08-24T14:15:22Z",
    "created_at": "2019-08-24T14:15:22Z",
    "leave_type_name": "string",
    "full_name": "string",
    "email": "user@example.com",
    "department": "string",
    "designation": "string",
    "reviewer_name": "string"
  }
}
```

<h3 id="submit-a-leave-request-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Leave request submitted|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="submit-a-leave-request-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|pending|
|status|approved|
|status|rejected|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## List the authenticated user's leave requests

<a id="opIdlistMyLeaveRequests"></a>

> Code samples

```http
GET http://localhost:5000/api/leave/requests/my HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/leave/requests/my`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "employee_id": 0,
      "leave_type_id": 0,
      "start_date": "2019-08-24",
      "end_date": "2019-08-24",
      "total_days": 0,
      "reason": "string",
      "status": "pending",
      "reviewed_by": 0,
      "reviewed_at": "2019-08-24T14:15:22Z",
      "created_at": "2019-08-24T14:15:22Z",
      "leave_type_name": "string",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string",
      "reviewer_name": "string"
    }
  ]
}
```

<h3 id="list-the-authenticated-user's-leave-requests-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Requests fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-the-authenticated-user's-leave-requests-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|pending|
|status|approved|
|status|rejected|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## List all leave requests

<a id="opIdlistAllLeaveRequests"></a>

> Code samples

```http
GET http://localhost:5000/api/leave/requests/all HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/leave/requests/all`

Requires the `admin`, `hr_officer`, or `payroll_officer` role.

<h3 id="list-all-leave-requests-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|status|query|string|false|none|
|employee_id|query|integer|false|none|

#### Enumerated Values

|Parameter|Value|
|---|---|
|status|pending|
|status|approved|
|status|rejected|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "employee_id": 0,
      "leave_type_id": 0,
      "start_date": "2019-08-24",
      "end_date": "2019-08-24",
      "total_days": 0,
      "reason": "string",
      "status": "pending",
      "reviewed_by": 0,
      "reviewed_at": "2019-08-24T14:15:22Z",
      "created_at": "2019-08-24T14:15:22Z",
      "leave_type_name": "string",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string",
      "reviewer_name": "string"
    }
  ]
}
```

<h3 id="list-all-leave-requests-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Requests fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-all-leave-requests-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|pending|
|status|approved|
|status|rejected|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Approve a leave request

<a id="opIdapproveLeaveRequest"></a>

> Code samples

```http
PATCH http://localhost:5000/api/leave/requests/{id}/approve HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`PATCH /api/leave/requests/{id}/approve`

Requires the `payroll_officer` role.

<h3 id="approve-a-leave-request-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "employee_id": 0,
    "leave_type_id": 0,
    "start_date": "2019-08-24",
    "end_date": "2019-08-24",
    "total_days": 0,
    "reason": "string",
    "status": "pending",
    "reviewed_by": 0,
    "reviewed_at": "2019-08-24T14:15:22Z",
    "created_at": "2019-08-24T14:15:22Z",
    "leave_type_name": "string",
    "full_name": "string",
    "email": "user@example.com",
    "department": "string",
    "designation": "string",
    "reviewer_name": "string"
  }
}
```

<h3 id="approve-a-leave-request-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Leave approved|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="approve-a-leave-request-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|pending|
|status|approved|
|status|rejected|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Reject a leave request

<a id="opIdrejectLeaveRequest"></a>

> Code samples

```http
PATCH http://localhost:5000/api/leave/requests/{id}/reject HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`PATCH /api/leave/requests/{id}/reject`

Requires the `payroll_officer` role.

<h3 id="reject-a-leave-request-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "employee_id": 0,
    "leave_type_id": 0,
    "start_date": "2019-08-24",
    "end_date": "2019-08-24",
    "total_days": 0,
    "reason": "string",
    "status": "pending",
    "reviewed_by": 0,
    "reviewed_at": "2019-08-24T14:15:22Z",
    "created_at": "2019-08-24T14:15:22Z",
    "leave_type_name": "string",
    "full_name": "string",
    "email": "user@example.com",
    "department": "string",
    "designation": "string",
    "reviewer_name": "string"
  }
}
```

<h3 id="reject-a-leave-request-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Leave rejected|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="reject-a-leave-request-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|pending|
|status|approved|
|status|rejected|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-payroll">Payroll</h1>

## Create or update a salary structure

<a id="opIdupsertSalaryStructure"></a>

> Code samples

```http
POST http://localhost:5000/api/payroll/salary-structure HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/payroll/salary-structure`

Requires the `admin` or `payroll_officer` role.

> Body parameter

```json
{
  "employee_id": 0,
  "basic_salary": 0.1,
  "hra_percent": 40,
  "special_allowance": 0,
  "effective_from": "2019-08-24"
}
```

<h3 id="create-or-update-a-salary-structure-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[SalaryStructureRequest](#schemasalarystructurerequest)|true|none|
|» employee_id|body|integer|true|none|
|» basic_salary|body|number(double)|true|none|
|» hra_percent|body|number(double)|false|none|
|» special_allowance|body|number(double)|false|none|
|» effective_from|body|string(date)|false|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "employee_id": 0,
    "basic_salary": 0.1,
    "hra_percent": 40,
    "special_allowance": 0,
    "effective_from": "2019-08-24",
    "id": 0,
    "created_at": "2019-08-24T14:15:22Z",
    "full_name": "string",
    "email": "user@example.com",
    "department": "string",
    "designation": "string"
  }
}
```

<h3 id="create-or-update-a-salary-structure-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Salary structure saved|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="create-or-update-a-salary-structure-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## List salary structures

<a id="opIdlistSalaryStructures"></a>

> Code samples

```http
GET http://localhost:5000/api/payroll/salary-structure HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/payroll/salary-structure`

Requires the `admin` or `payroll_officer` role.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "employee_id": 0,
      "basic_salary": 0.1,
      "hra_percent": 40,
      "special_allowance": 0,
      "effective_from": "2019-08-24",
      "id": 0,
      "created_at": "2019-08-24T14:15:22Z",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string"
    }
  ]
}
```

<h3 id="list-salary-structures-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Salary structures fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-salary-structures-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get an employee's salary structure

<a id="opIdgetSalaryStructure"></a>

> Code samples

```http
GET http://localhost:5000/api/payroll/salary-structure/{employee_id} HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/payroll/salary-structure/{employee_id}`

Requires the `admin` or `payroll_officer` role.

<h3 id="get-an-employee's-salary-structure-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|employee_id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "employee_id": 0,
    "basic_salary": 0.1,
    "hra_percent": 40,
    "special_allowance": 0,
    "effective_from": "2019-08-24",
    "id": 0,
    "created_at": "2019-08-24T14:15:22Z",
    "full_name": "string",
    "email": "user@example.com",
    "department": "string",
    "designation": "string"
  }
}
```

<h3 id="get-an-employee's-salary-structure-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Salary structure fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-an-employee's-salary-structure-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Generate or regenerate a pay run

<a id="opIdgeneratePayrun"></a>

> Code samples

```http
POST http://localhost:5000/api/payroll/payrun/generate HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`POST /api/payroll/payrun/generate`

Requires the `payroll_officer` role.

> Body parameter

```json
{
  "month": 1,
  "year": 2000
}
```

<h3 id="generate-or-regenerate-a-pay-run-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» month|body|integer|true|none|
|» year|body|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "payrun_id": 0,
    "payslips_generated_count": 0
  }
}
```

<h3 id="generate-or-regenerate-a-pay-run-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Pay run generated|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[ErrorResponse](#schemaerrorresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="generate-or-regenerate-a-pay-run-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## List pay runs

<a id="opIdlistPayruns"></a>

> Code samples

```http
GET http://localhost:5000/api/payroll/payruns HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/payroll/payruns`

Requires the `admin` or `payroll_officer` role.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "month": 1,
      "year": 0,
      "status": "draft",
      "generated_by": 0,
      "generated_at": "2019-08-24T14:15:22Z",
      "generated_by_name": "string",
      "total_cost": "string",
      "employee_count": "string"
    }
  ]
}
```

<h3 id="list-pay-runs-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Pay runs fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-pay-runs-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|status|draft|
|status|finalized|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## List payslips in a pay run

<a id="opIdlistPayrunPayslips"></a>

> Code samples

```http
GET http://localhost:5000/api/payroll/payruns/{id}/payslips HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/payroll/payruns/{id}/payslips`

Requires the `admin` or `payroll_officer` role.

<h3 id="list-payslips-in-a-pay-run-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "payrun_id": 0,
      "employee_id": 0,
      "working_days": 0,
      "present_days": "string",
      "leaves_approved": 0,
      "unpaid_leave_days": 0,
      "unpaid_deduction": "string",
      "basic": "string",
      "hra": "string",
      "special_allowance": "string",
      "gross_salary": "string",
      "pf_employee": "string",
      "pf_employer": "string",
      "professional_tax": "string",
      "total_deductions": "string",
      "net_pay": "string",
      "created_at": "2019-08-24T14:15:22Z",
      "month": 0,
      "year": 0,
      "payrun_status": "string",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string",
      "date_joined": "2019-08-24",
      "user_id": 0
    }
  ]
}
```

<h3 id="list-payslips-in-a-pay-run-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Payslips fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-payslips-in-a-pay-run-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## List the authenticated user's payslips

<a id="opIdlistMyPayslips"></a>

> Code samples

```http
GET http://localhost:5000/api/payroll/payslips/my HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/payroll/payslips/my`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "payrun_id": 0,
      "employee_id": 0,
      "working_days": 0,
      "present_days": "string",
      "leaves_approved": 0,
      "unpaid_leave_days": 0,
      "unpaid_deduction": "string",
      "basic": "string",
      "hra": "string",
      "special_allowance": "string",
      "gross_salary": "string",
      "pf_employee": "string",
      "pf_employer": "string",
      "professional_tax": "string",
      "total_deductions": "string",
      "net_pay": "string",
      "created_at": "2019-08-24T14:15:22Z",
      "month": 0,
      "year": 0,
      "payrun_status": "string",
      "full_name": "string",
      "email": "user@example.com",
      "department": "string",
      "designation": "string",
      "date_joined": "2019-08-24",
      "user_id": 0
    }
  ]
}
```

<h3 id="list-the-authenticated-user's-payslips-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Payslips fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-the-authenticated-user's-payslips-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get a payslip

<a id="opIdgetPayslip"></a>

> Code samples

```http
GET http://localhost:5000/api/payroll/payslips/{id} HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/payroll/payslips/{id}`

Employees may only access their own payslips.

<h3 id="get-a-payslip-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "payrun_id": 0,
    "employee_id": 0,
    "working_days": 0,
    "present_days": "string",
    "leaves_approved": 0,
    "unpaid_leave_days": 0,
    "unpaid_deduction": "string",
    "basic": "string",
    "hra": "string",
    "special_allowance": "string",
    "gross_salary": "string",
    "pf_employee": "string",
    "pf_employer": "string",
    "professional_tax": "string",
    "total_deductions": "string",
    "net_pay": "string",
    "created_at": "2019-08-24T14:15:22Z",
    "month": 0,
    "year": 0,
    "payrun_status": "string",
    "full_name": "string",
    "email": "user@example.com",
    "department": "string",
    "designation": "string",
    "date_joined": "2019-08-24",
    "user_id": 0
  }
}
```

<h3 id="get-a-payslip-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Payslip fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-a-payslip-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Download a payslip PDF

<a id="opIddownloadPayslipPdf"></a>

> Code samples

```http
GET http://localhost:5000/api/payroll/payslips/{id}/pdf HTTP/1.1
Host: localhost:5000
Accept: application/pdf

```

`GET /api/payroll/payslips/{id}/pdf`

Employees may only download their own payslips.

<h3 id="download-a-payslip-pdf-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

> 401 Response

```json
{
  "success": false,
  "message": "string",
  "error": "string",
  "hint": "string"
}
```

<h3 id="download-a-payslip-pdf-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Payslip PDF|string|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Disposition|string||Attachment filename.|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-dashboard">Dashboard</h1>

## Get the admin dashboard

<a id="opIdgetAdminDashboard"></a>

> Code samples

```http
GET http://localhost:5000/api/dashboard/admin HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/dashboard/admin`

Requires the `admin` role.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

<h3 id="get-the-admin-dashboard-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Dashboard data fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-the-admin-dashboard-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get the authenticated employee dashboard

<a id="opIdgetEmployeeDashboard"></a>

> Code samples

```http
GET http://localhost:5000/api/dashboard/employee HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/dashboard/employee`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

<h3 id="get-the-authenticated-employee-dashboard-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Dashboard data fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-the-authenticated-employee-dashboard-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get the HR dashboard

<a id="opIdgetHrDashboard"></a>

> Code samples

```http
GET http://localhost:5000/api/dashboard/hr HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/dashboard/hr`

Requires the `admin` or `hr_officer` role.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

<h3 id="get-the-hr-dashboard-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Dashboard data fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-the-hr-dashboard-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get the payroll dashboard

<a id="opIdgetPayrollDashboard"></a>

> Code samples

```http
GET http://localhost:5000/api/dashboard/payroll HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/dashboard/payroll`

Requires the `admin` or `payroll_officer` role.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

<h3 id="get-the-payroll-dashboard-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Dashboard data fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-the-payroll-dashboard-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-notifications">Notifications</h1>

## List the authenticated user's notifications

<a id="opIdlistNotifications"></a>

> Code samples

```http
GET http://localhost:5000/api/notifications HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/notifications`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "user_id": 0,
      "title": "string",
      "message": "string",
      "type": "string",
      "is_read": true,
      "created_at": "2019-08-24T14:15:22Z"
    }
  ]
}
```

<h3 id="list-the-authenticated-user's-notifications-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Notifications fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-the-authenticated-user's-notifications-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Mark a notification as read

<a id="opIdmarkNotificationRead"></a>

> Code samples

```http
PUT http://localhost:5000/api/notifications/{id}/read HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`PUT /api/notifications/{id}/read`

<h3 id="mark-a-notification-as-read-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 0,
    "user_id": 0,
    "title": "string",
    "message": "string",
    "type": "string",
    "is_read": true,
    "created_at": "2019-08-24T14:15:22Z"
  }
}
```

<h3 id="mark-a-notification-as-read-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Notification marked as read|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Resource not found|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="mark-a-notification-as-read-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Mark all notifications as read

<a id="opIdmarkAllNotificationsRead"></a>

> Code samples

```http
PUT http://localhost:5000/api/notifications/read-all HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`PUT /api/notifications/read-all`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string"
}
```

<h3 id="mark-all-notifications-as-read-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|All notifications marked as read|[MessageResponse](#schemamessageresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-settings">Settings</h1>

## Get application settings

<a id="opIdgetSettings"></a>

> Code samples

```http
GET http://localhost:5000/api/settings HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/settings`

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "company_name": "EmPay Ltd",
    "company_email": "hr@example.com",
    "timezone": "Africa/Lagos",
    "work_start_time": "09:00",
    "work_end_time": "17:00"
  }
}
```

<h3 id="get-application-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Settings fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-application-settings-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Update application settings

<a id="opIdupdateSettings"></a>

> Code samples

```http
PUT http://localhost:5000/api/settings HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

`PUT /api/settings`

Requires the `admin` role. Each supplied key is stored as a setting.

> Body parameter

```json
{
  "company_name": "EmPay Ltd",
  "company_email": "hr@example.com",
  "timezone": "Africa/Lagos",
  "work_start_time": "09:00",
  "work_end_time": "17:00"
}
```

<h3 id="update-application-settings-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[Settings](#schemasettings)|true|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "company_name": "EmPay Ltd",
    "company_email": "hr@example.com",
    "timezone": "Africa/Lagos",
    "work_start_time": "09:00",
    "work_end_time": "17:00"
  }
}
```

<h3 id="update-application-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Settings updated|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="update-application-settings-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Get database statistics

<a id="opIdgetDatabaseStats"></a>

> Code samples

```http
GET http://localhost:5000/api/settings/db-stats HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/settings/db-stats`

Requires the `admin` role.

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

<h3 id="get-database-statistics-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Database statistics fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="get-database-statistics-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-search">Search</h1>

## Search users

<a id="opIdsearchUsers"></a>

> Code samples

```http
GET http://localhost:5000/api/search?q=string HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/search`

Queries shorter than two characters return an empty array.

<h3 id="search-users-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|q|query|string|true|Search text matched against name, email, department, and designation.|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "full_name": "string",
      "email": "user@example.com",
      "role": "admin",
      "department": "string",
      "designation": "string",
      "phone": "string",
      "profile_pic": "string",
      "date_joined": "2019-08-24",
      "is_active": true,
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "type": "user"
    }
  ]
}
```

<h3 id="search-users-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Search results|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="search-users-responseschema">Response Schema</h3>

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|
|role|admin|
|role|hr_officer|
|role|employee|
|role|payroll_officer|
|type|user|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="empay-hrms-api-audit">Audit</h1>

## List audit logs

<a id="opIdlistAuditLogs"></a>

> Code samples

```http
GET http://localhost:5000/api/admin/audit-logs HTTP/1.1
Host: localhost:5000
Accept: application/json

```

`GET /api/admin/audit-logs`

Requires the `admin` role.

<h3 id="list-audit-logs-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|user_id|query|integer|false|none|
|action|query|string|false|none|
|target_type|query|string|false|none|
|start_date|query|string(date)|false|none|
|end_date|query|string(date)|false|none|
|page|query|integer|false|none|
|limit|query|integer|false|none|

> Example responses

> 200 Response

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": 0,
      "user_id": 0,
      "action": "string",
      "target_id": 0,
      "target_type": "string",
      "metadata": {},
      "ip_address": "string",
      "created_at": "2019-08-24T14:15:22Z",
      "full_name": "string",
      "email": "user@example.com"
    }
  ],
  "total": 0,
  "page": 0,
  "totalPages": 0
}
```

<h3 id="list-audit-logs-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Audit logs fetched|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing, expired, or invalid bearer token, or invalid login credentials|[ErrorResponse](#schemaerrorresponse)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Authenticated user lacks permission|[ErrorResponse](#schemaerrorresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Internal server error|[ErrorResponse](#schemaerrorresponse)|

<h3 id="list-audit-logs-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» success|boolean|true|none|none|
|» message|string|true|none|none|
|» data|[[AuditLog](#schemaauditlog)]|true|none|none|
|»» id|integer(int64)|false|none|none|
|»» user_id|integer|false|none|none|
|»» action|string|false|none|none|
|»» target_id|integer(int64)|false|none|none|
|»» target_type|string|false|none|none|
|»» metadata|object¦null|false|none|none|
|»» ip_address|string|false|none|none|
|»» created_at|string(date-time)|false|none|none|
|»» full_name|string¦null|false|none|none|
|»» email|string(email)¦null|false|none|none|
|» total|integer|true|none|none|
|» page|integer|true|none|none|
|» totalPages|integer|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

# Schemas

<h2 id="tocS_UserRole">UserRole</h2>
<!-- backwards compatibility -->
<a id="schemauserrole"></a>
<a id="schema_UserRole"></a>
<a id="tocSuserrole"></a>
<a id="tocsuserrole"></a>

```json
"admin"

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|*anonymous*|admin|
|*anonymous*|hr_officer|
|*anonymous*|employee|
|*anonymous*|payroll_officer|

<h2 id="tocS_SuccessResponse">SuccessResponse</h2>
<!-- backwards compatibility -->
<a id="schemasuccessresponse"></a>
<a id="schema_SuccessResponse"></a>
<a id="tocSsuccessresponse"></a>
<a id="tocssuccessresponse"></a>

```json
{
  "success": true,
  "message": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|success|boolean|true|none|none|
|message|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<h2 id="tocS_MessageResponse">MessageResponse</h2>
<!-- backwards compatibility -->
<a id="schemamessageresponse"></a>
<a id="schema_MessageResponse"></a>
<a id="tocSmessageresponse"></a>
<a id="tocsmessageresponse"></a>

```json
{
  "success": true,
  "message": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|success|boolean|true|none|none|
|message|string|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<h2 id="tocS_ErrorResponse">ErrorResponse</h2>
<!-- backwards compatibility -->
<a id="schemaerrorresponse"></a>
<a id="schema_ErrorResponse"></a>
<a id="tocSerrorresponse"></a>
<a id="tocserrorresponse"></a>

```json
{
  "success": false,
  "message": "string",
  "error": "string",
  "hint": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|success|boolean|true|none|none|
|message|string|true|none|none|
|error|string|false|none|none|
|hint|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|success|false|

<h2 id="tocS_HealthResponse">HealthResponse</h2>
<!-- backwards compatibility -->
<a id="schemahealthresponse"></a>
<a id="schema_HealthResponse"></a>
<a id="tocShealthresponse"></a>
<a id="tocshealthresponse"></a>

```json
{
  "success": true,
  "message": "string",
  "timestamp": "2019-08-24T14:15:22Z"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|success|boolean|true|none|none|
|message|string|true|none|none|
|timestamp|string(date-time)|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|success|true|

<h2 id="tocS_User">User</h2>
<!-- backwards compatibility -->
<a id="schemauser"></a>
<a id="schema_User"></a>
<a id="tocSuser"></a>
<a id="tocsuser"></a>

```json
{
  "id": 0,
  "full_name": "string",
  "email": "user@example.com",
  "role": "admin",
  "department": "string",
  "designation": "string",
  "phone": "string",
  "profile_pic": "string",
  "date_joined": "2019-08-24",
  "is_active": true,
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|full_name|string|false|none|none|
|email|string(email)|false|none|none|
|role|[UserRole](#schemauserrole)|false|none|none|
|department|string¦null|false|none|none|
|designation|string¦null|false|none|none|
|phone|string¦null|false|none|none|
|profile_pic|string¦null|false|none|none|
|date_joined|string(date)|false|none|none|
|is_active|boolean|false|none|none|
|created_at|string(date-time)|false|none|none|
|updated_at|string(date-time)|false|none|none|

<h2 id="tocS_RegisterRequest">RegisterRequest</h2>
<!-- backwards compatibility -->
<a id="schemaregisterrequest"></a>
<a id="schema_RegisterRequest"></a>
<a id="tocSregisterrequest"></a>
<a id="tocsregisterrequest"></a>

```json
{
  "full_name": "string",
  "email": "user@example.com",
  "password": "pa$$word",
  "role": "admin",
  "department": "string",
  "designation": "string",
  "phone": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|full_name|string|true|none|none|
|email|string(email)|true|none|none|
|password|string(password)|true|none|none|
|role|[UserRole](#schemauserrole)|true|none|none|
|department|string¦null|false|none|none|
|designation|string¦null|false|none|none|
|phone|string¦null|false|none|none|

<h2 id="tocS_LoginRequest">LoginRequest</h2>
<!-- backwards compatibility -->
<a id="schemaloginrequest"></a>
<a id="schema_LoginRequest"></a>
<a id="tocSloginrequest"></a>
<a id="tocsloginrequest"></a>

```json
{
  "email": "user@example.com",
  "password": "pa$$word"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|email|string(email)|true|none|none|
|password|string(password)|true|none|none|

<h2 id="tocS_UpdateUserRequest">UpdateUserRequest</h2>
<!-- backwards compatibility -->
<a id="schemaupdateuserrequest"></a>
<a id="schema_UpdateUserRequest"></a>
<a id="tocSupdateuserrequest"></a>
<a id="tocsupdateuserrequest"></a>

```json
{
  "full_name": "string",
  "department": "string",
  "designation": "string",
  "phone": "string",
  "profile_pic": "string",
  "role": "admin",
  "password": "pa$$word"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|full_name|string|false|none|none|
|department|string|false|none|none|
|designation|string|false|none|none|
|phone|string|false|none|none|
|profile_pic|string|false|none|none|
|role|[UserRole](#schemauserrole)|false|none|none|
|password|string(password)|false|none|none|

<h2 id="tocS_AttendanceRecord">AttendanceRecord</h2>
<!-- backwards compatibility -->
<a id="schemaattendancerecord"></a>
<a id="schema_AttendanceRecord"></a>
<a id="tocSattendancerecord"></a>
<a id="tocsattendancerecord"></a>

```json
{
  "id": 0,
  "employee_id": 0,
  "date": "2019-08-24",
  "check_in": "string",
  "check_out": "string",
  "accumulated_minutes": 0,
  "duration_minutes": 0,
  "status": "present",
  "created_at": "2019-08-24T14:15:22Z",
  "full_name": "string",
  "email": "user@example.com",
  "department": "string",
  "designation": "string",
  "profile_pic": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|employee_id|integer|false|none|none|
|date|string(date)|false|none|none|
|check_in|string¦null|false|none|none|
|check_out|string¦null|false|none|none|
|accumulated_minutes|integer|false|none|none|
|duration_minutes|integer¦null|false|none|none|
|status|string|false|none|none|
|created_at|string(date-time)|false|none|none|
|full_name|string|false|none|none|
|email|string(email)|false|none|none|
|department|string¦null|false|none|none|
|designation|string¦null|false|none|none|
|profile_pic|string¦null|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|present|
|status|absent|
|status|half_day|
|status|on_leave|
|status|unpaid_leave|

<h2 id="tocS_AttendanceSummary">AttendanceSummary</h2>
<!-- backwards compatibility -->
<a id="schemaattendancesummary"></a>
<a id="schema_AttendanceSummary"></a>
<a id="tocSattendancesummary"></a>
<a id="tocsattendancesummary"></a>

```json
{
  "present": "string",
  "absent": "string",
  "half_day": "string",
  "on_leave": "string",
  "total_working_days": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|present|string|false|none|PostgreSQL count value|
|absent|string|false|none|PostgreSQL count value|
|half_day|string|false|none|PostgreSQL count value|
|on_leave|string|false|none|PostgreSQL count value|
|total_working_days|string|false|none|PostgreSQL count value|

<h2 id="tocS_LeaveType">LeaveType</h2>
<!-- backwards compatibility -->
<a id="schemaleavetype"></a>
<a id="schema_LeaveType"></a>
<a id="tocSleavetype"></a>
<a id="tocsleavetype"></a>

```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "max_days_per_year": 0,
  "is_paid": true
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|name|string|false|none|none|
|description|string¦null|false|none|none|
|max_days_per_year|integer|false|none|none|
|is_paid|boolean|false|none|none|

<h2 id="tocS_LeaveAllocation">LeaveAllocation</h2>
<!-- backwards compatibility -->
<a id="schemaleaveallocation"></a>
<a id="schema_LeaveAllocation"></a>
<a id="tocSleaveallocation"></a>
<a id="tocsleaveallocation"></a>

```json
{
  "id": 0,
  "employee_id": 0,
  "leave_type_id": 0,
  "allocated_days": 0,
  "used_days": 0,
  "year": 0,
  "name": "string",
  "max_days_per_year": 0,
  "remaining": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|employee_id|integer|false|none|none|
|leave_type_id|integer|false|none|none|
|allocated_days|integer|false|none|none|
|used_days|integer|false|none|none|
|year|integer|false|none|none|
|name|string|false|none|none|
|max_days_per_year|integer|false|none|none|
|remaining|integer|false|none|none|

<h2 id="tocS_LeaveRequest">LeaveRequest</h2>
<!-- backwards compatibility -->
<a id="schemaleaverequest"></a>
<a id="schema_LeaveRequest"></a>
<a id="tocSleaverequest"></a>
<a id="tocsleaverequest"></a>

```json
{
  "id": 0,
  "employee_id": 0,
  "leave_type_id": 0,
  "start_date": "2019-08-24",
  "end_date": "2019-08-24",
  "total_days": 0,
  "reason": "string",
  "status": "pending",
  "reviewed_by": 0,
  "reviewed_at": "2019-08-24T14:15:22Z",
  "created_at": "2019-08-24T14:15:22Z",
  "leave_type_name": "string",
  "full_name": "string",
  "email": "user@example.com",
  "department": "string",
  "designation": "string",
  "reviewer_name": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|employee_id|integer|false|none|none|
|leave_type_id|integer|false|none|none|
|start_date|string(date)|false|none|none|
|end_date|string(date)|false|none|none|
|total_days|integer|false|none|none|
|reason|string¦null|false|none|none|
|status|string|false|none|none|
|reviewed_by|integer¦null|false|none|none|
|reviewed_at|string(date-time)¦null|false|none|none|
|created_at|string(date-time)|false|none|none|
|leave_type_name|string|false|none|none|
|full_name|string|false|none|none|
|email|string(email)|false|none|none|
|department|string¦null|false|none|none|
|designation|string¦null|false|none|none|
|reviewer_name|string¦null|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|pending|
|status|approved|
|status|rejected|

<h2 id="tocS_SalaryStructureRequest">SalaryStructureRequest</h2>
<!-- backwards compatibility -->
<a id="schemasalarystructurerequest"></a>
<a id="schema_SalaryStructureRequest"></a>
<a id="tocSsalarystructurerequest"></a>
<a id="tocssalarystructurerequest"></a>

```json
{
  "employee_id": 0,
  "basic_salary": 0.1,
  "hra_percent": 40,
  "special_allowance": 0,
  "effective_from": "2019-08-24"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|employee_id|integer|true|none|none|
|basic_salary|number(double)|true|none|none|
|hra_percent|number(double)|false|none|none|
|special_allowance|number(double)|false|none|none|
|effective_from|string(date)|false|none|none|

<h2 id="tocS_SalaryStructure">SalaryStructure</h2>
<!-- backwards compatibility -->
<a id="schemasalarystructure"></a>
<a id="schema_SalaryStructure"></a>
<a id="tocSsalarystructure"></a>
<a id="tocssalarystructure"></a>

```json
{
  "employee_id": 0,
  "basic_salary": 0.1,
  "hra_percent": 40,
  "special_allowance": 0,
  "effective_from": "2019-08-24",
  "id": 0,
  "created_at": "2019-08-24T14:15:22Z",
  "full_name": "string",
  "email": "user@example.com",
  "department": "string",
  "designation": "string"
}

```

### Properties

allOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|[SalaryStructureRequest](#schemasalarystructurerequest)|false|none|none|

and

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|object|false|none|none|
|» id|integer|false|none|none|
|» created_at|string(date-time)|false|none|none|
|» full_name|string|false|none|none|
|» email|string(email)|false|none|none|
|» department|string¦null|false|none|none|
|» designation|string¦null|false|none|none|

<h2 id="tocS_Payrun">Payrun</h2>
<!-- backwards compatibility -->
<a id="schemapayrun"></a>
<a id="schema_Payrun"></a>
<a id="tocSpayrun"></a>
<a id="tocspayrun"></a>

```json
{
  "id": 0,
  "month": 1,
  "year": 0,
  "status": "draft",
  "generated_by": 0,
  "generated_at": "2019-08-24T14:15:22Z",
  "generated_by_name": "string",
  "total_cost": "string",
  "employee_count": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|month|integer|false|none|none|
|year|integer|false|none|none|
|status|string|false|none|none|
|generated_by|integer¦null|false|none|none|
|generated_at|string(date-time)|false|none|none|
|generated_by_name|string¦null|false|none|none|
|total_cost|string¦null|false|none|PostgreSQL numeric aggregate|
|employee_count|string|false|none|PostgreSQL count value|

#### Enumerated Values

|Property|Value|
|---|---|
|status|draft|
|status|finalized|

<h2 id="tocS_Payslip">Payslip</h2>
<!-- backwards compatibility -->
<a id="schemapayslip"></a>
<a id="schema_Payslip"></a>
<a id="tocSpayslip"></a>
<a id="tocspayslip"></a>

```json
{
  "id": 0,
  "payrun_id": 0,
  "employee_id": 0,
  "working_days": 0,
  "present_days": "string",
  "leaves_approved": 0,
  "unpaid_leave_days": 0,
  "unpaid_deduction": "string",
  "basic": "string",
  "hra": "string",
  "special_allowance": "string",
  "gross_salary": "string",
  "pf_employee": "string",
  "pf_employer": "string",
  "professional_tax": "string",
  "total_deductions": "string",
  "net_pay": "string",
  "created_at": "2019-08-24T14:15:22Z",
  "month": 0,
  "year": 0,
  "payrun_status": "string",
  "full_name": "string",
  "email": "user@example.com",
  "department": "string",
  "designation": "string",
  "date_joined": "2019-08-24",
  "user_id": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|payrun_id|integer|false|none|none|
|employee_id|integer|false|none|none|
|working_days|integer|false|none|none|
|present_days|string|false|none|PostgreSQL numeric value|
|leaves_approved|integer|false|none|none|
|unpaid_leave_days|integer|false|none|none|
|unpaid_deduction|string|false|none|none|
|basic|string|false|none|none|
|hra|string|false|none|none|
|special_allowance|string|false|none|none|
|gross_salary|string|false|none|none|
|pf_employee|string|false|none|none|
|pf_employer|string|false|none|none|
|professional_tax|string|false|none|none|
|total_deductions|string|false|none|none|
|net_pay|string|false|none|none|
|created_at|string(date-time)|false|none|none|
|month|integer|false|none|none|
|year|integer|false|none|none|
|payrun_status|string|false|none|none|
|full_name|string|false|none|none|
|email|string(email)|false|none|none|
|department|string¦null|false|none|none|
|designation|string¦null|false|none|none|
|date_joined|string(date)|false|none|none|
|user_id|integer|false|none|none|

<h2 id="tocS_Notification">Notification</h2>
<!-- backwards compatibility -->
<a id="schemanotification"></a>
<a id="schema_Notification"></a>
<a id="tocSnotification"></a>
<a id="tocsnotification"></a>

```json
{
  "id": 0,
  "user_id": 0,
  "title": "string",
  "message": "string",
  "type": "string",
  "is_read": true,
  "created_at": "2019-08-24T14:15:22Z"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|user_id|integer|false|none|none|
|title|string|false|none|none|
|message|string|false|none|none|
|type|string|false|none|none|
|is_read|boolean|false|none|none|
|created_at|string(date-time)|false|none|none|

<h2 id="tocS_Settings">Settings</h2>
<!-- backwards compatibility -->
<a id="schemasettings"></a>
<a id="schema_Settings"></a>
<a id="tocSsettings"></a>
<a id="tocssettings"></a>

```json
{
  "company_name": "EmPay Ltd",
  "company_email": "hr@example.com",
  "timezone": "Africa/Lagos",
  "work_start_time": "09:00",
  "work_end_time": "17:00"
}

```

Dynamic key/value application settings.

### Properties

*None*

<h2 id="tocS_AuditLog">AuditLog</h2>
<!-- backwards compatibility -->
<a id="schemaauditlog"></a>
<a id="schema_AuditLog"></a>
<a id="tocSauditlog"></a>
<a id="tocsauditlog"></a>

```json
{
  "id": 0,
  "user_id": 0,
  "action": "string",
  "target_id": 0,
  "target_type": "string",
  "metadata": {},
  "ip_address": "string",
  "created_at": "2019-08-24T14:15:22Z",
  "full_name": "string",
  "email": "user@example.com"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer(int64)|false|none|none|
|user_id|integer|false|none|none|
|action|string|false|none|none|
|target_id|integer(int64)|false|none|none|
|target_type|string|false|none|none|
|metadata|object¦null|false|none|none|
|ip_address|string|false|none|none|
|created_at|string(date-time)|false|none|none|
|full_name|string¦null|false|none|none|
|email|string(email)¦null|false|none|none|

