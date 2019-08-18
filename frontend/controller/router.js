import Vue from 'vue'
import Router from 'vue-router'
import store from '@model/state.js'
// TODO: move create group in modal container
import CreateGroup from '@pages/CreateGroup.vue'
import {
  GroupName,
  GroupPurpose,
  GroupMincome,
  GroupRules,
  GroupPrivacy,
  GroupInvitees
} from '@components/CreateGroupSteps/index.js'
import DesignSystem from '@pages/DesignSystem.vue'
import Home from '@pages/Home.vue'
import Messages from '@pages/Messages.vue'
import GroupDashboard from '@pages/GroupDashboard.vue'
import Contributions from '@pages/Contributions.vue'
import PayGroup from '@pages/PayGroup.vue'
import GroupChat from '@pages/GroupChat.vue'
import Invite from '@pages/Invite.vue'
import Join from '@pages/Join.vue'
import Mailbox from '@pages/Mailbox.vue'
import Vote from '@pages/Vote.vue'
import GroupSettings from '@pages/GroupSettings.vue'
import GroupWelcome from '@pages/GroupWelcome.vue'

Vue.use(Router)

/*
 The following are reusable guard for routes
 the 'guard' defines how the route is blocked and the redirect determines the redirect behavior
 when a route is blocked
 */
var homeGuard = {
  guard: (to, from) => !!store.state.currentGroupId,
  redirect: (to, from) => ({ path: '/dashboard' })
}
var loginGuard = {
  guard: (to, from) => !store.state.loggedIn,
  redirect: (to, from) => ({ path: '/', query: { next: to.path } })
}
// Check if user has a group
var groupGuard = {
  guard: (to, from) => !store.state.currentGroupId,
  redirect: (to, from) => ({ path: '/new-group' })
}
// var mailGuard = {
//   guard: (to, from) => from.name !== Mailbox.name,
//   redirect: (to, from) => ({ path: '/mailbox' })
// }
function createEnterGuards (...guards) {
  return function (to, from, next) {
    for (const current of guards) {
      if (current.guard(to, from)) {
        return next(current.redirect(to, from))
      }
    }
    next()
  }
}
var router = new Router({
  mode: 'history',
  base: '/app',
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      component: Home,
      name: 'home',
      meta: {
        title: 'Group Income' // page title. see issue #45
      },
      beforeEnter: createEnterGuards(homeGuard)
    },
    {
      path: '/design-system',
      component: DesignSystem,
      name: DesignSystem.name,
      meta: {
        title: 'Design System'
      }
      // beforeEnter: createEnterGuards(designGuard)
    },
    {
      path: '/new-group',
      component: CreateGroup,
      name: CreateGroup.name,
      meta: {
        title: 'Start A Group'
      },
      beforeEnter: createEnterGuards(loginGuard),
      children: [
        {
          path: 'name',
          name: GroupName.name,
          meta: {
            title: 'Start A Group - Name Your Group'
          },
          component: GroupName
        },
        {
          path: 'purpose',
          name: GroupPurpose.name,
          meta: {
            title: 'Start A Group - Group Purpose'
          },
          component: GroupPurpose
        },
        {
          path: 'income',
          name: GroupMincome.name,
          meta: {
            title: 'Start A Group - Minimum Income'
          },
          component: GroupMincome
        },
        {
          path: 'rules',
          name: GroupRules.name,
          meta: {
            title: 'Start A Group - Rules'
          },
          component: GroupRules
        },
        {
          path: 'privacy',
          name: GroupPrivacy.name,
          meta: {
            title: 'Start A Group - Privacy'
          },
          component: GroupPrivacy
        },
        {
          path: 'invitees',
          name: GroupInvitees.name,
          meta: {
            title: 'Start A Group - Invite Members'
          },
          component: GroupInvitees
        }
      ]
    },
    {
      path: '/welcome',
      component: GroupWelcome,
      name: GroupWelcome.name,
      meta: {
        title: 'Your Group Created'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '/dashboard',
      component: GroupDashboard,
      name: GroupDashboard.name,
      meta: {
        title: 'Group Dashboard'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    // NOTE: do not delete this! Event though we no longer use it,
    //       we keep it around to demonstrate how to asynchronously
    //       load a route using import() function
    // {
    //   path: '/user-group',
    //   component: () => import('../views/UserGroup.vue'),
    //   meta: {
    //     title: 'Your Group'
    //   }
    // },
    {
      path: '/contributions',
      component: Contributions,
      meta: {
        title: 'Contributions'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '/pay-group',
      component: PayGroup,
      meta: {
        title: 'Pay Group'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    /* Guards need to be created for any route that should not be directly accessed by url */
    {
      path: '/invite',
      name: Invite.name,
      component: Invite,
      meta: {
        title: 'Invite Group Members'
      },
      beforeEnter: createEnterGuards(loginGuard, groupGuard)
    },
    {
      path: '/mailbox',
      name: Mailbox.name,
      component: Mailbox,
      meta: {
        title: 'Mailbox'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '/messages',
      name: 'Messages',
      component: Messages,
      meta: {
        title: 'Messages'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '/messages/:chatName',
      name: 'MessagesConversation',
      component: Messages,
      beforeEnter: createEnterGuards(loginGuard)
      // BUG/REVIEW "CANNOT GET /:username" when username has "." in it
      // ex: messages/joe.kim doesnt work but messages/joekim works fine.
      // Possible Solution: https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations
    },
    {
      path: '/group-chat',
      component: GroupChat,
      name: 'GroupChat',
      meta: {
        title: 'Group Chat'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '/group-settings',
      component: GroupSettings,
      name: 'GroupSettings',
      meta: {
        title: 'Group Seettings'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '/group-chat/:chatName',
      component: GroupChat,
      name: 'GroupChatConversation',
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '/join',
      name: Join.name,
      component: Join,
      meta: {
        title: 'Join a Group'
      },
      // beforeEnter: createEnterGuards(loginGuard, mailGuard)
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '/vote',
      name: Vote.name,
      component: Vote,
      meta: {
        title: 'Vote on a Proposal'
      },
      beforeEnter: createEnterGuards(loginGuard)
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

export default router
