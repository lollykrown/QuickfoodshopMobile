export function priceFormat(val) {
  const number = Number(val) || 0;
  return number.toLocaleString("en-UK", { style: "currency", currency: "GBP", });
}

export const menuOptions = (pathname, router, role, isLoggedIn) => {
  if (!isLoggedIn) {
    return [
      {
        label: 'Login to account',
        icon: 'login',
        active: pathname === '/login',
        onPress: () => router.push('/customer/login?prev=home'),
      },
    ];
  }

  return role === 'customer' ? [
        {
          label: 'Dashboard',
          icon: 'view-dashboard',
          active: pathname === '/dashboard',
          onPress: () => router.push('/dashboard'),
        },
        // {
        //   label: 'Notifications',
        //   icon: 'bell',
        //   badge: 3,
        //   active: pathname.includes('/notifications'),
        //   onPress: () => router.push('/dashboard/notifications'),
        // },
        {
          label: 'Orders',
          icon: 'human-queue',
          active: pathname.includes('/orders'),
          href:'/dashboard/orders',
          onPress: () => router.push('/dashboard/orders'),
        },
        {
          label: 'Tracking',
          icon: 'map-marker',
          active: pathname.includes('/tracking'),
                    href:'/dashboard/tracking',

          onPress: () => router.push('/dashboard/tracking'),
        },
        {
          label: 'Transactions',
          icon: 'compare-horizontal',
          active: pathname.includes('/transactions'),
                    href:'/dashboard/transactions',

          onPress: () => router.push('/dashboard/transactions'),
        },
        {
          label: 'My Invoice',
          icon: 'invoice-edit',
          active: pathname.includes('/invoice'),
          onPress: () => router.push('/dashboard/invoice'),
        },
        {
          label: 'My favorites',
          icon: 'cards-heart',
          active: pathname.includes('/favorites'),
          onPress: () => router.push('/dashboard/favorites'),
        },
        {
          label: 'Settings',
          icon: 'cog',
          active: pathname.includes('/settings'),
          onPress: () => router.push('/dashboard/settings'),
        },
      ] : role === 'vendor'?[
        {
          label: 'Dashboard',
          icon: 'view-dashboard',
          active: pathname === '/dashboard',
          onPress: () => router.push('/dashboard'),
        },
        {
          label: 'Orders',
          icon: 'human-queue',
          active: pathname.includes('/orders'),
          href:'/dashboard/orders',
          onPress: () => router.push('/dashboard/orders'),
        },
        {
          label: 'Tracking',
          icon: 'map-marker',
          active: pathname.includes('/tracking'),
          href:'/dashboard/tracking',
          onPress: () => router.push('/dashboard/tracking'),
        },
        {
          label: 'Assigned Riders',
          icon: 'truck-delivery',
          active: pathname.includes('/activeRiders'),
          href:'/dashboard/activeRiders',
          onPress: () => router.push('/dashboard/activeRiders'),
        },
        {
          label: 'Transactions',
          icon: 'compare-horizontal',
          active: pathname.includes('/transactions'),
          href:'/dashboard/transactions',
          onPress: () => router.push('/dashboard/transactions'),
        },
        {
          label: 'Invoice',
          icon: 'invoice-edit',
          active: pathname.includes('/invoice'),
          onPress: () => router.push('/dashboard/invoice'),
        },
        {
          label: 'My Store',
          icon: 'store',
          active: pathname.includes('/store'),
          onPress: () => router.push('/dashboard/store'),
        },
        {
          label: 'Withdrawal',
          icon: 'cash-multiple',
          active: pathname.includes('/withdrawal'),
          onPress: () => router.push('/dashboard/withdrawal'),
        },
        {
          label: 'Settings',
          icon: 'cog',
          active: pathname.includes('/settings'),
          onPress: () => router.push('/dashboard/settings'),
        },
      ]:[
        {
          label: 'Dashboard',
          icon: 'view-dashboard',
          active: pathname === '/dashboard',
          onPress: () => router.push('/dashboard'),
        }, 
        {
          label: 'Orders',
          icon: 'human-queue',
          active: pathname.includes('/orders'),
          href:'/dashboard/orders',
          onPress: () => router.push('/dashboard/orders'),
        },
        {
          label: 'Requests',
          icon: 'human-queue',
          active: pathname.includes('/requests'),
          href:'/dashboard/requests',
          onPress: () => router.push('/dashboard/requests'),
        },
        {
          label: 'Tracking',
          icon: 'map-marker',
          active: pathname.includes('/tracking'),
          href:'/dashboard/tracking',
          onPress: () => router.push('/dashboard/tracking'),
        },
        {
          label: 'Transactions',
          icon: 'compare-horizontal',
          active: pathname.includes('/transactions'),
          href:'/dashboard/transactions',
          onPress: () => router.push('/dashboard/transactions'),
        },
        {
          label: 'Withdrawal',
          icon: 'cash-multiple',
          active: pathname.includes('/withdrawal'),
          onPress: () => router.push('/dashboard/withdrawal'),
        },
        {
          label: 'Settings',
          icon: 'cog',
          active: pathname.includes('/settings'),
          onPress: () => router.push('/dashboard/settings'),
        },  
      ]
}