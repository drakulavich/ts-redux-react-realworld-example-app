PACTICIPANT ?= "ts-redux-react-realworld-example-app"

## ====================
## Pactflow Consumer Publishing
## ====================
PACT_CLI="docker run --rm -v ${PWD}:/app -w "/app" -e PACT_BROKER_BASE_URL -e PACT_BROKER_TOKEN pactfoundation/pact-cli"
PACTS_PATH?=pacts

# Export all variable to sub-make if .env exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

default: test

ci: test-ci publish_pacts can_i_deploy

# Run the ci target from a developer machine with the environment variables
# set as if it was on CI.
# Use this for quick feedback when playing around with your workflows.
fake_ci:
	@CI=true \
	GIT_COMMIT=`git rev-parse --short HEAD`+`date +%s` \
	GIT_BRANCH=`git rev-parse --abbrev-ref HEAD` \
	make ci

## =====================
## Build/test tasks
## =====================

test-ci:
	@echo "\n========== STAGE: test ==========\n"
	npm test -- --watchAll=false

test:
	npm run test -- --coverage

## =====================
## Pact tasks
## =====================

publish_pacts:
	@echo "\n========== STAGE: publish consumer pacts ==========\n"
	"${PACT_CLI}" publish \
	/app/${PACTS_PATH} \
	--consumer-app-version ${GIT_COMMIT} \
	--branch ${GIT_BRANCH}

deploy: deploy_app record_deployment

can_i_deploy:
	@echo "\n========== STAGE: can-i-deploy? 🌉 ==========\n"
	"${PACT_CLI}" broker can-i-deploy \
	  --pacticipant ${PACTICIPANT} \
	  --version ${GIT_COMMIT} \
	  --to-environment test \
	  --retry-while-unknown 0 \
	  --retry-interval 10

deploy_app:
	@echo "\n========== STAGE: deploy ==========\n"
	@echo "Deploying to test"

record_deployment:
	"${PACT_CLI}" broker record-deployment --pacticipant ${PACTICIPANT} --version ${GIT_COMMIT} --environment test

## ======================
## Misc
## ======================

.env:
	cp -n .env.example .env || true

output:
	mkdir -p ./pacts
	touch ./pacts/tmp

clean: output
	rm pacts/*

lint:
	npm run lint
	npm run prettier:check

install: install-deps

install-deps:
	npm ci --prefer-offline --no-audit
