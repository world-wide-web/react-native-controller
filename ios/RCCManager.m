#import "RCCManager.h"
#import "RCTBridge.h"
#import "RCTRedBox.h"
#import <Foundation/Foundation.h>

@interface RCCManager()
@property (nonatomic, strong) NSMutableDictionary *modulesRegistry;
@property (nonatomic, strong) RCTBridge *sharedBridge;
@end

@implementation RCCManager

+ (instancetype)sharedIntance
{
  static RCCManager *sharedIntance = nil;
  static dispatch_once_t onceToken = 0;

  dispatch_once(&onceToken,^{
    if (sharedIntance == nil)
    {
      sharedIntance = [[RCCManager alloc] init];
    }
  });

  return sharedIntance;
}

- (instancetype)init
{
  if (self = [super init])
  {
  }
  return self;
}

-(void)registerController:(UIViewController*)controller componentId:(NSString*)componentId
{
  if (controller == nil || componentId == nil)
  {
    return;
  }

  NSMutableDictionary *componentsDic = self.modulesRegistry;
  if (componentsDic[componentId])
  {
    [self.sharedBridge.redBox showErrorMessage:[NSString stringWithFormat:@"Controllers: controller with id %@ is already registered. Make sure all of the controller id's you use are unique.", componentId]];
  }
  componentsDic[componentId] = controller;
}

-(id)getControllerWithAddress:(NSNumber*)address
{
  return (__bridge id)((void *)address.unsignedIntegerValue);
}

-(void)initBridgeWithBundleURL:(NSURL *)bundleURL
{
  if (self.sharedBridge) return;
  RCTBridge *bridge = [[RCTBridge alloc] initWithBundleURL:bundleURL
                                            moduleProvider:nil
                                             launchOptions:nil];
  self.sharedBridge = bridge;
}

-(RCTBridge*)getBridge
{
  return self.sharedBridge;
}

@end
