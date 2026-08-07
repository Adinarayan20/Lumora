import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { STARTER_LIBRARY_CATALOG, UniqueEntityId } from '@lumora/shared';
import {
  mapManifestToResponseDto,
  TemplateManifestResponseDto,
} from '../dtos/template-manifest-response.dto.js';
import { TemplatePlannerService } from '../../../domain/templates/services/template-planner.service.js';
import { DefaultTemplatePolicyEngine } from '../../../domain/templates/services/template-policy-engine.js';
import { TemplateInstallerService } from '../../../domain/templates/services/template-installer.service.js';

@Controller('api/v1/templates')
export class TemplatesController {
  private readonly planner: TemplatePlannerService;
  private readonly installer: TemplateInstallerService;

  constructor() {
    const policyEngine = new DefaultTemplatePolicyEngine();
    this.planner = new TemplatePlannerService(policyEngine);
    this.installer = new TemplateInstallerService();
  }

  @Get('starter')
  public getStarterCatalog(): TemplateManifestResponseDto[] {
    return STARTER_LIBRARY_CATALOG.map((pkg) =>
      mapManifestToResponseDto(pkg.manifest),
    );
  }

  @Post('plan')
  @HttpCode(HttpStatus.OK)
  public async planInstallation(
    @Body()
    body: {
      templateKey: string;
      workspaceId: string;
      dryRun?: boolean;
    },
  ) {
    const pkg = STARTER_LIBRARY_CATALOG.find(
      (p) => p.manifest.key === body.templateKey,
    );
    if (!pkg) {
      return {
        success: false,
        error: `Template '${body.templateKey}' not found in catalog.`,
      };
    }

    const result = await this.planner.planInstallation(
      pkg,
      new UniqueEntityId(body.workspaceId),
      { dryRun: body.dryRun ?? true },
    );

    if (result.isFailure) {
      return { success: false, error: result.getError().message };
    }

    return { success: true, data: result.getValue() };
  }

  @Post('install')
  @HttpCode(HttpStatus.OK)
  public async installTemplate(
    @Body() body: { templateKey: string; workspaceId: string; userId: string },
  ) {
    const pkg = STARTER_LIBRARY_CATALOG.find(
      (p) => p.manifest.key === body.templateKey,
    );
    if (!pkg) {
      return {
        success: false,
        error: `Template '${body.templateKey}' not found in catalog.`,
      };
    }

    const planResult = await this.planner.planInstallation(
      pkg,
      new UniqueEntityId(body.workspaceId),
      { dryRun: false },
    );

    if (planResult.isFailure) {
      return { success: false, error: planResult.getError().message };
    }

    const installResult = await this.installer.install(
      planResult.getValue(),
      new UniqueEntityId(body.userId),
    );

    if (installResult.isFailure) {
      return { success: false, error: installResult.getError().message };
    }

    return {
      success: true,
      message: `Template '${body.templateKey}' installed successfully.`,
    };
  }
}
